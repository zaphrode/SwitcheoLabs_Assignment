document.addEventListener('DOMContentLoaded', () => {
    const fromAmountInput = document.getElementById('from-amount');
    const toAmountInput = document.getElementById('to-amount');
    const fromSelectedOption = document.getElementById('from-selected-option');
    const toSelectedOption = document.getElementById('to-selected-option');
    const fromTokenOptions = document.getElementById('from-token-options');
    const toTokenOptions = document.getElementById('to-token-options');
    const swapButton = document.getElementById('swap-button');
    const errorMessage = document.getElementById('error-message');
    let tokenPrices = {};

    const fetchTokenPrices = async () => {
        try {
            const response = await fetch('tokenPrices.json');
            tokenPrices = await response.json();
            populateTokenOptions();
        } catch (error) {
            showError('Error fetching token prices.');
        }
    };

    const populateTokenOptions = () => {
        for (let token in tokenPrices) {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-content';
            optionElement.innerHTML = `
                <img src="${tokenPrices[token].logo}" alt="${token}" class="token-logo">
                <span>${token}</span>
            `;
            optionElement.addEventListener('click', () => {
                selectToken('from', token);
                calculateConversion();
            });
            fromTokenOptions.appendChild(optionElement);

            const optionElementTo = optionElement.cloneNode(true);
            optionElementTo.addEventListener('click', () => {
                selectToken('to', token);
                calculateConversion();
            });
            toTokenOptions.appendChild(optionElementTo);
        }
    };

    const selectToken = (type, token) => {
        const selectedOptionElement = type === 'from' ? fromSelectedOption : toSelectedOption;
        selectedOptionElement.innerHTML = `
            <img src="${tokenPrices[token].logo}" alt="${token}" class="token-logo">
            <span>${token}</span>
        `;
        closeDropdown(type);
        calculateConversion();
    };

    const closeDropdown = (type) => {
        const dropdown = type === 'from' ? fromTokenOptions : toTokenOptions;
        dropdown.style.display = 'none';
    };

    const calculateConversion = () => {
        const fromAmount = parseFloat(fromAmountInput.value);
        const fromToken = fromSelectedOption.textContent.trim();
        const toToken = toSelectedOption.textContent.trim();

        if (isNaN(fromAmount) || fromAmount <= 0) {
            showError('Please enter a valid amount.');
            return;
        }

        if (fromToken === toToken) {
            showError('Please select different tokens to swap.');
            return;
        }

        if (tokenPrices[fromToken] && tokenPrices[toToken]) {
            const convertedAmount = (fromAmount * tokenPrices[fromToken].price) / tokenPrices[toToken].price;
            toAmountInput.value = convertedAmount.toFixed(4);
            errorMessage.style.display = 'none';
        } else {
            showError('Invalid token selection.');
        }
    };

    fromAmountInput.addEventListener('input', calculateConversion);
    fromSelectedOption.addEventListener('click', () => {
        fromTokenOptions.style.display = fromTokenOptions.style.display === 'block' ? 'none' : 'block';
    });
    toSelectedOption.addEventListener('click', () => {
        toTokenOptions.style.display = toTokenOptions.style.display === 'block' ? 'none' : 'block';
    });

    swapButton.addEventListener('click', () => {
        if (toAmountInput.value === '') {
            showError('Please fill out all fields correctly before swapping.');
        } else {
            alert(`Swapped ${fromAmountInput.value} ${fromSelectedOption.textContent.trim()} for ${toAmountInput.value} ${toSelectedOption.textContent.trim()}`);
        }
    });

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    fetchTokenPrices();
});
