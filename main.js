// ページの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', () => {
    
    // HTMLの要素を取得
    const selector = document.getElementById('promptSelector');
    const display = document.getElementById('promptDisplay');
    const copyButton = document.getElementById('copyButton');
    const copyMessage = document.getElementById('copyMessage');
    
    let promptsData = []; // JSONデータを保持する配列

    // 1. JSONファイルを読み込む
    fetch('prompts.json')
        .then(response => response.json())
        .then(data => {
            promptsData = data; // データを変数に保存
            
            // 2. ドロップダウンメニューを生成
            promptsData.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id; // valueにidを設定
                option.textContent = p.title; // 見えるテキストにtitleを設定
                selector.appendChild(option);
            });

            // 3. 初期表示
            // ページ読み込み時に最初のプロンプトをテキストエリアに表示
            if (promptsData.length > 0) {
                display.value = promptsData[0].prompt;
            }
        });

    // 4. ドロップダウン変更時のイベント
    selector.addEventListener('change', () => {
        const selectedId = selector.value;
        // 保存したデータからIDが一致するプロンプトを検索
        const selectedPrompt = promptsData.find(p => p.id === selectedId);
        if (selectedPrompt) {
            display.value = selectedPrompt.prompt;
        }
        copyMessage.textContent = ''; // 選択し直したらメッセージを消す
    });

    // 5. コピーボタンのイベント
    copyButton.addEventListener('click', () => {
        if (!display.value) {
            copyMessage.textContent = 'コピーするテキストがありません。';
            copyMessage.style.color = 'red';
            return;
        }

        // テキストエリアの内容をクリップボードにコピー
        navigator.clipboard.writeText(display.value)
            .then(() => {
                // 成功時
                copyMessage.textContent = 'コピーしました！';
                copyMessage.style.color = 'green';
                // 2秒後にメッセージを消す
                setTimeout(() => {
                    copyMessage.textContent = '';
                }, 2000);
            })
            .catch(err => {
                // 失敗時
                copyMessage.textContent = 'コピーに失敗しました。';
                copyMessage.style.color = 'red';
                console.error('Copy failed:', err);
            });
    });
});
