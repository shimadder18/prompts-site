// ページのDOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

  // 1. HTML要素を取得
  const grid = document.getElementById('grid');
  const q = document.getElementById('q');
  const tagSel = document.getElementById('tag');
  const empty = document.getElementById('empty');
  
  let DATA = []; // 全プロンプトデータを保持する配列

  // 2. 描画・コピー・フィルタリングの関数を定義
  
  /**
   * DATAに基づいて画面を描画する関数
   */
  function render(){
    grid.innerHTML = ''; // 一旦リセット
    const text = (q.value||'').toLowerCase(); // 検索語
    const tag = tagSel.value; // 選択されたタグ

    // 検索語とタグでフィルタリング
    const matched = DATA.filter(d => {
      // 検索対象の全テキストを結合
      const hay = (d.title + ' ' + d.body + ' ' + d.tags.join(' ') + ' ' + d.code).toLowerCase();
      const okText = !text || hay.includes(text);
      const okTag = !tag || d.tags.includes(tag);
      return okText && okTag;
    });

    // 検索結果0件の表示制御
    empty.style.display = matched.length ? 'none' : 'block';

    // フィルタリングされた項目を描画
    matched.forEach(d => {
      const card = document.createElement('section');
      card.className = 'card';

      const header = document.createElement('div');
      header.className = 'card-header';
      header.innerHTML = `
        <div>
          <div class="title">${d.title}</div>
          <div class="meta">${d.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </div>`;

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `
        <div>${d.body}</div>
        <details>
          <summary>コードを表示</summary>
          <div class="code-toolbar">
            <span>コード</span>
            <button class="copy" data-id="${d.id}">Copy</button>
          </div>
          <pre><code id="code-${d.id}"></code></pre>
        </details>`;
      
      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card); // <<< ここがエラーになっている

      // code-X にプロンプト本文をテキストとして設定 (HTMLとして解釈させない)
      body.querySelector('#code-'+d.id).textContent = d.code;
    });

    // Copyボタンにイベントを設定 (描画のたびに再設定)
    document.querySelectorAll('.copy').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const code = document.getElementById('code-'+id).textContent;
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = 'Copied!';
          setTimeout(()=>btn.textContent='Copy',1200);
        } catch(e){
          btn.textContent = '失敗';
          setTimeout(()=>btn.textContent='Copy',1200);
        }
      };
    });
  } // --- render() 関数の定義ここまで ---


  // 3. イベントリスナーを設定
  q.addEventListener('input', render); // 検索ボックス
  tagSel.addEventListener('change', render); // タグ選択
  document.getElementById('expand').onclick = () => document.querySelectorAll('details').forEach(d => d.open = true); // すべて展開
  document.getElementById('collapse').onclick = () => document.querySelectorAll('details').forEach(d => d.open = false); // すべて閉じる

  
  // 4. メイン処理：JSONを読み込んでページ初期化
  fetch('prompts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(jsonData => {
      DATA = jsonData; // 読み込んだデータをグローバル変数に格納
      
      // タグ選択肢を動的に生成
      const tagSet = new Set();
      DATA.forEach(d => d.tags.forEach(t => tagSet.add(t)));
      [...tagSet].sort().forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        tagSel.appendChild(opt); // <<< あるいはここがエラーの可能性
      });
      
      // 最初の描画を実行
      render();
    })
    .catch(err => {
      // エラー処理
      console.error('JSONの読み込みに失敗しました:', err);
      empty.textContent = 'データの読み込みに失敗しました。prompts.jsonファイルを確認してください。';
      empty.style.display = 'block';
    });

});
