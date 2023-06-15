// -- GLOBAL --
const MAX_CHARS = 150;

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn__text');
const spinnerEl = document.querySelector('.spinner');

const renderFeedbackItem = feedbackItem => {
    const feedbackItemHTML = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">${feedbackItem.text}</p>
            </div>
            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
        </li>
    `;
    
    // insert feedback item into our template
    feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
};


// -- COUNTER COMPONENT --
textareaEl.addEventListener('input', () => {
    counterEl.textContent = MAX_CHARS - textareaEl.value.length;
});


// -- FORM COMPONENT -- 
const showVisualIndicator = textCheck => {
    const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';

    textareaEl.classList.add(className);

    setTimeout(() => {
        textareaEl.classList.remove(className);
    }, 2000);
};


formEl.addEventListener('submit', event => {
    // prevent default browser action
    event.preventDefault();

    //get text from textarea
    const text = textareaEl.value;

    // validate text (e.g. check if "#" is present, is text long enough?)
    if (text.includes('#') && text.length >= 5) {
        showVisualIndicator('valid');
    } else {
        showVisualIndicator('invalid');

        // focus textarea
        textareaEl.focus();
        return;
    }

    // we have a valid sumbition, now we need to extract info from it
    const hashtag = text.split(' ').find(word => word.includes('#')).trim();
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0, 1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    // create feedback item object
    const feedbackItem = {
        upvoteCount: upvoteCount,
        company: company,
        badgeLetter: badgeLetter,
        daysAgo: daysAgo,
        text: text
    };

    // render feedback item
    renderFeedbackItem(feedbackItem);

    // rest our form
    textareaEl.value = '';
    submitBtnEl.blur();
    counterEl.textContent = MAX_CHARS;
});


// -- FEEDBACK LIST COMPONENT --
fetch('https://bytegrad.com/course-assets/js/1/api/feedbacks')
    .then(response => response.json())
    .then(data => {
        // remove spinner
        spinnerEl.remove();
        // iterate over the feedbakcs attribute (Array of feedback objects) from our response
        data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem));
    })
    .catch(error => {
        feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
    }); 