// -- COUNTER COMPONENT --
const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');

textareaEl.addEventListener('input', () => {
    counterEl.textContent = 150 - textareaEl.value.length;
});