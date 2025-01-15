const newReviewForm = document.getElementById('new-review-form');

function closeRequest(model, requestId) {
    fetch('/admin/content-review-dashboard/close/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': '{{ csrf_token }}',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'model': model,
            'request_id': requestId
        })
    }).then(response => {
        if (response.ok) {
            window.location.href = document.referrer
        } else {
            console.log(response)
        }
    });
}

function addReview() {
    const newReviewForm = document.getElementById('new-review-form');
    newReviewForm.classList.toggle('hidden')
}

newReviewForm.addEventListener('submit', function(event) {
    event.preventDefault();
    submitReview();
})

function submitReview(userId, model, requestId) {
    console.log("TEST")
    const note = document.getElementById('new-review-note').value
    fetch('/admin/content-review-dashboard/add-review/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': '{{ csrf_token }}',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'note': note,
            'user_id': userId,
            'model': model,
            'request_id': requestId
        })
    }).then(response => {
        newReviewForm.classList.toggle('hidden')
        if (response.ok) {
            window.location.reload();
        } else {
            console.log(response)
        }
    });
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "block";
}

function hideConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "none";
}