// ページの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('promptSelector');
    const display = document.getElementById('promptDisplay');

    // 1. JSONファイルを読み込む
    fetch('prompts.json')
        .then(response => response.json())
        .then(prompts => {
            // 2. ドロップダウンメニューを生成
            prompts.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = p.title;
                selector.appendChild(option);
            });

            // 3. 選択時のイベントを設定
            selector.addEventListener('change', () => {
                const selectedId = selector.value;
                const selectedPrompt = prompts.find(p => p.id === selectedId);
                if (selectedPrompt) {
                    display.value = selectedPrompt.prompt;
                }
            });

            // 初期表示として最初のプロンプトを表示
            if (prompts.length > 0) {
                display.value = prompts[0].prompt;
            }
        });
});