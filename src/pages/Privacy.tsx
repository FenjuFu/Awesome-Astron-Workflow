import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const UPDATED = '2026-05-29';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 prose prose-sm sm:prose max-w-none">
          <h1>隐私政策</h1>
          <p className="text-gray-500">最近更新：{UPDATED}</p>

          <p>
            本页面说明 Astron 学习助手（以下简称“AI Chat”）如何收集、使用和保护你在使用过程中产生的信息。
            使用 AI Chat 即表示你已阅读并同意本政策。
          </p>

          <h2>一、我们收集什么</h2>
          <ul>
            <li>
              <strong>你的提问内容</strong>：你在 AI Chat 输入框发送的文本。
            </li>
            <li>
              <strong>助手的回复内容</strong>：模型针对你的提问生成的回答。
            </li>
            <li>
              <strong>基础元数据</strong>：所用模型名称、产生时间。我们<strong>不会</strong>主动收集你的姓名、手机号、邮箱等身份信息——除非你在提问内容里自行输入。
            </li>
          </ul>

          <h2>二、用途</h2>
          <ul>
            <li>向你实时返回问答结果；</li>
            <li>分析高频问题、改进知识库与产品体验。</li>
          </ul>
          <p>我们不会将上述内容用于与改进服务无关的目的，也不会出售你的数据。</p>

          <h2>三、第三方处理</h2>
          <p>
            为了生成回答，你的提问会被发送至 <strong>讯飞星辰 MaaS</strong>（
            <a href="https://maas.xfyun.cn/modelSquare" target="_blank" rel="noopener noreferrer">
              maas.xfyun.cn
            </a>
            ）进行大模型推理。该处理过程受其相应服务条款与隐私政策约束。
          </p>

          <h2>四、存储与留存</h2>
          <ul>
            <li>
              <strong>本地缓存</strong>：你的聊天记录会保存在<strong>你自己浏览器</strong>的 localStorage 中，
              便于下次打开时延续对话。你可随时点击聊天界面右上角的清空按钮删除，或清理浏览器数据。
            </li>
            <li>
              <strong>服务端记录</strong>：在你同意后，我们会将问答内容存入受控的后端数据库（Supabase），
              仅用于第二条所述用途，且不对公众开放读取。
            </li>
          </ul>

          <h2>五、你的选择与权利</h2>
          <ul>
            <li>首次进入 AI Chat 时，你可以选择是否同意服务端记录；不同意则无法使用 AI Chat 的对话功能。</li>
            <li>你可随时清空本地聊天记录。</li>
            <li>如需删除已记录的服务端数据，可通过下方联系方式提出。</li>
          </ul>

          <h2>六、联系我们</h2>
          <p>
            如对本政策或你的数据有任何疑问，可在项目仓库提交 Issue：
            <a href="https://github.com/topics/iflytek-astron" target="_blank" rel="noopener noreferrer">
              github.com/topics/iflytek-astron
            </a>
            。
          </p>

          <p>
            <Link to="/chat">← 返回 AI Chat</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
