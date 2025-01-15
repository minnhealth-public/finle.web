/**
 * Fetch the options for the parent select element from the /api/clips endpoint using the current values of
 * the video and type select elements.
 * @param video_value The current value of the video select element.
 * @param type_value The current value of the type select element.
 * @param endpoint_value The url of the get_clips endpoint.
 * @returns {Promise<any>} The options as a JSON array.
 */
async function fetch_parent_options(video_value, type_value, endpoint_value) {
    const input = `${endpoint_value}?video=${video_value}&type=${type_value}&paginate=false`;
    const response = await fetch(input, {credentials: 'include'});
    return await response.json();
}

/**
 * Populates the options of the parent select element from the clips.
 * @param parent The parent select element.
 * @param clips The clips as a JSON array.
 */
function populate_parent_options(parent, clips) {
    const parent_value = parent.value;
    let options = '';
    let option_selected = false;
    for (let clip of clips) {
        let selected = '';
        if (clip.id === parent_value) {
            selected = ' selected';
            option_selected = true;
        }
        options += `<option value="${clip.id}"${selected}>${clip.name}</option>`;
    }
    options = `<option value=""${option_selected ? '' : ' selected'}>---------</option>` + options;
    parent.innerHTML = options;
}

/**
 * Updates the options of the parent select element from the values of the video and type select elements.
 * @param video The video select element.
 * @param type The video type element.
 * @param parent The parent type element.
 * @param endpoint The element that stores the URL of the get_clips endpoint.
 */
function update_parent_options(video, type, parent, endpoint) {
    const video_value = video.value;
    let type_value = type.value;
    if (video_value === '' || type_value === '' || type_value === 'LONG') {
        populate_parent_options(parent, []);
    } else {
        const endpoint_value = endpoint.value;

        if (type_value === 'SHORT') {
            type_value = 'MEDIUM';
        } else if (type_value === 'MEDIUM') {
            type_value = 'LONG';
        }

        fetch_parent_options(video_value, type_value, endpoint_value).then(
            function (clips) {
                populate_parent_options(parent, clips);
            },
            function (error) {
                alert(`Server Communication Error: ${error}`);
            }
        );
    }
}


/**
 * Handle the video and type select elements' change events by updating the options of the parent select element.
 * ToDo: Sometimes the update_parent_options event handler is immediately called. Investigate.
 */
window.onload = function () {
    const video = document.getElementById("id_video");
    const type = document.getElementById("id_type");
    const parent = document.getElementById("id_parent");
    // this script is attached to all CRUD operations; only handle change events for create and update operations
    if (parent != null && type != null && video != null) {
        const endpoint = document.getElementById("id_endpoint");

        video.onchange = function () {
            update_parent_options(video, type, parent, endpoint);
        };
        type.onchange = function () {
            update_parent_options(video, type, parent, endpoint);
        };
    }
};
