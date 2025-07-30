document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);

        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon');
        iconDiv.innerHTML = type === 'user-message' ? '🧑‍💻' : '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        if (type === 'bot-message') {
            contentDiv.innerHTML = marked.parse(text);
        } else {
            contentDiv.innerText = text;
        }

        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);

        addCopyButtons(contentDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    function addCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre');
        codeBlocks.forEach(block => {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.innerText = 'Copy';

            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
            wrapper.appendChild(copyButton);

            copyButton.addEventListener('click', () => {
                const codeElem = block.querySelector('code');
                const code = codeElem ? codeElem.innerText : block.innerText;
                navigator.clipboard.writeText(code);
                copyButton.innerText = 'Copied!';
                setTimeout(() => {
                    copyButton.innerText = 'Copy';
                }, 2000);
            });
        });
    }

    function showTypingIndicator() {
        const html = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        const indicator = appendMessage(html, 'bot-message');
        indicator.id = 'typing-indicator';
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) chatBox.removeChild(indicator);
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        appendMessage(userMessage, 'user-message');
        userInput.value = '';
        userInput.focus();

        showTypingIndicator();
        await getBotResponseFromAPI(userMessage);
    }

    async function getBotResponseFromAPI(userMessage) {
        try {
            const response = await fetch('http://localhost:3000/api/genai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error');
            }

            const data = await response.json();
            removeTypingIndicator();
            appendMessage(data.reply, 'bot-message');
        } catch (error) {
            removeTypingIndicator();
            appendMessage(`Error: ${error.message}`, 'bot-message');
        }
    }
});