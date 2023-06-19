// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn__text');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEl = document.querySelector('.hashtags');

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


const submitHandler = async event => {
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

    // render feedback item in list
    const feedbackItem = {
        upvoteCount: upvoteCount,
        company: company,
        badgeLetter: badgeLetter,
        daysAgo: daysAgo,
        text: text
    };
    renderFeedbackItem(feedbackItem);

    // send feedback item to server
    try {
        const result = await fetch(`${BASE_API_URL}/feedbacks`, {
            method: 'POST',
            body: JSON.stringify(feedbackItem),
            headers: {
                Acccept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await result.json();

        if (!result.ok) {
            console.log(data.description);
            return;
        }

        console.log('Successfully submitted', data);
    } catch (error) {
        console.log(`Failed to submit data to server. Error message: ${error.message}`);
    }

    // reset our form
    textareaEl.value = '';
    submitBtnEl.blur();
    counterEl.textContent = MAX_CHARS;
};
formEl.addEventListener('submit', submitHandler);


// -- FEEDBACK LIST COMPONENT --
const clickHandler = event => {
    // get clicked HTML-element
    const clickedEl = event.target;

    // determine if user intended to upvote or expand
    const upvoteIntention = clickedEl.className.includes('upvote');

    // upvate logic
    if (upvoteIntention) {
        //get closest upvote element
        const upvoteBtnEl = clickedEl.closest('.upvote');

        // disable upvote button
        upvoteBtnEl.disabled = true;

        //get upvote number
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');

        //convert to number
        let upvoteCount = +upvoteCountEl.textContent;

        // update upvoute count
        upvoteCountEl.textContent = ++upvoteCount;
    } else {
        // expand the clicked item
        clickedEl.closest('.feedback').classList.toggle('feedback--expand');
    }
};
feedbackListEl.addEventListener('click', clickHandler);

fetch(`${BASE_API_URL}/feedbacks`)
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


// -- HASHTAG LIST COMPONENT ==
(() => {   
    const clickHandler = event => {
        //get clicked element
        const clickedEl = event.target;

    // stop function if click happened in list, but outside buttons
    if (clickedEl.className.includes('hashtags')) return;
    
    // extract company name
    const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim();
    console.log(companyNameFromHashtag);
    
    //iterate over each item in feedback list
    feedbackListEl.childNodes.forEach(childNode => {
        // dtop iteration if there is a text node
        if (childNode.nodeType === 3) return;
        
        // extract company name
        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
        console.log(companyNameFromFeedbackItem);
        // remove feedback items that don't have the selected company name
        if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
            childNode.remove();
        }
    });
};
hashtagListEl.addEventListener('click', clickHandler);
})();