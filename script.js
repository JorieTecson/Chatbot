// script.js
document.addEventListener("DOMContentLoaded", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("close-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotIcon = document.getElementById("chatbot-icon");

    // === TOGGLE CHATBOT VISIBILITY ===
    chatbotIcon.addEventListener("click", function () {
        chatbotContainer.classList.remove("hidden");
        chatbotIcon.style.display = "none"; // Hide chat icon
        chatbotMessages.innerHTML = ""; // Clear old messages (optional)
        
        // 🧠 Add greeting message when chatbot opens
        appendMessage("bot", "👋 Hello! I'm <b>Jorie</b>. What can I help you?");
        
        scrollToBottom();
    });

    closeBtn.addEventListener("click", function () {
        chatbotContainer.classList.add("hidden");
        chatbotIcon.style.display = "flex"; // Show chat icon again
    });

    // === MESSAGE SENDING HANDLER ===
    sendBtn.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Auto-scroll while typing
    chatbotInput.addEventListener("input", function () {
        scrollToBottom();
    });

    function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        if (userMessage) {
            appendMessage("user", userMessage);
            chatbotInput.value = "";
            getBotResponse(userMessage);
        }
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.innerHTML = message; // allows HTML (bold, emojis, etc.)
        chatbotMessages.appendChild(messageElement);
        scrollToBottom();
    }

    // 🔽 Helper function for smooth auto-scroll
    function scrollToBottom() {
        chatbotMessages.scrollTo({
            top: chatbotMessages.scrollHeight,
            behavior: "smooth",
        });
    }

    // ===============================
    // 🔽 API CONFIGURATION & FUNCTION 🔽
    // ===============================

    let _config = {
        openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
        openAI_model: "gpt-4o-mini",
        ai_instruction: `you are teacher gives questions about Javascript.
        output should be in html format,
        no markdown format, answer directly.`,
        response_id: "",
    };

    async function getBotResponse(userMessage) {
        let requestBody = {
            model: _config.openAI_model,
            input: userMessage,
            instructions: _config.ai_instruction,
            previous_response_id: _config.response_id,
        };

        if (_config.response_id.length === 0) {
            requestBody = {
                model: _config.openAI_model,
                input: userMessage,
                instructions: _config.ai_instruction,
            };
        }

        try {
            const response = await fetch(_config.openAI_api, {
                method: "POST",
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response from API:", data);

            const botMessage = data.output[0].content[0].text;
            _config.response_id = data.id;

            appendMessage("bot", botMessage);
        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            appendMessage("bot", "⚠️ Sorry, something went wrong. Please try again.");
        }
    }
});
