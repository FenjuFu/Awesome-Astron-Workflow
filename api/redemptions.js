import cookie from 'cookie';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const LIMITED_PRIZE_INVENTORY = {
  tianjin_ai_innovation_conference_ticket_20250711: 1,
};

const ACTIVE_REDEMPTION_STATUSES = ['pending', 'issued'];

export const buildPrizeAvailability = (redemptions, inventoryMap = LIMITED_PRIZE_INVENTORY) =>
  Object.fromEntries(
    Object.entries(inventoryMap).map(([prizeId, inventory]) => {
      const redeemed = redemptions.filter((entry) =>
        entry.prize_id === prizeId && ACTIVE_REDEMPTION_STATUSES.includes(entry.status)
      ).length;

      return [
        prizeId,
        {
          inventory,
          redeemed,
          remaining: Math.max(inventory - redeemed, 0),
          soldOut: redeemed >= inventory,
        },
      ];
    })
  );

const getLimitedPrizeIds = () => Object.keys(LIMITED_PRIZE_INVENTORY);

export default async function handler(req, res) {
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;
  const authHeader = req.headers['x-admin-password'];
  const isAdmin = adminPassword && authHeader === adminPassword;

  if (isAdmin) {
    if (req.method === 'GET') {
      return await handleGetAllRedemptions(res);
    } else if (req.method === 'PATCH') {
      return await handleUpdateRedemptionStatus(req.body, res);
    }
  }

  // Regular user operations
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.gh_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch GitHub user info to verify token and get login
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    return res.status(userResponse.status).json({ error: 'Failed to fetch user from GitHub' });
  }

  const userData = await userResponse.json();
  const githubLogin = userData.login;

  if (req.method === 'GET') {
    return await handleGetRedemptions(githubLogin, res);
  } else if (req.method === 'POST') {
    return await handleCreateRedemption(githubLogin, req.body, res);
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function handleGetAllRedemptions(res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('redemptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching all redemptions:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateRedemptionStatus(body, res) {
  const { id, status } = body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('redemptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating redemption status:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGetRedemptions(githubLogin, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('redemptions')
      .select('*')
      .eq('github_login', githubLogin)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const limitedPrizeIds = getLimitedPrizeIds();
    let availability = {};

    if (limitedPrizeIds.length > 0) {
      const { data: limitedRedemptions, error: availabilityError } = await supabaseAdmin
        .from('redemptions')
        .select('prize_id, status')
        .in('prize_id', limitedPrizeIds)
        .in('status', ACTIVE_REDEMPTION_STATUSES);

      if (availabilityError) throw availabilityError;
      availability = buildPrizeAvailability(limitedRedemptions || []);
    }

    return res.status(200).json({
      redemptions: data,
      prizeAvailability: availability,
    });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreateRedemption(githubLogin, body, res) {
  const { prizeId, prizeName, pointsSpent, phone, email, name, address, remark } = body;

  if (!prizeId || !prizeName || !pointsSpent || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const inventory = LIMITED_PRIZE_INVENTORY[prizeId];
    if (typeof inventory === 'number') {
      const { count, error: countError } = await supabaseAdmin
        .from('redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('prize_id', prizeId)
        .in('status', ACTIVE_REDEMPTION_STATUSES);

      if (countError) throw countError;

      if ((count || 0) >= inventory) {
        return res.status(409).json({ error: 'Prize sold out' });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('redemptions')
      .insert([
        {
          github_login: githubLogin,
          prize_id: prizeId,
          prize_name: prizeName,
          points_spent: pointsSpent,
          phone,
          email,
          recipient_name: name,
          address,
          remark,
          status: 'pending',
        },
      ])
      .select();

    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating redemption:', error);
    return res.status(500).json({ error: error.message });
  }
}
