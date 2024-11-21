const limit = 25;
const rateDelay = 150;
let page = 1;
let getContactsListQueryUrl = '/api/v4/contacts';
let setTaskQueryUrl = '/api/v4/tasks';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getContacts(page) {
    return $.ajax({
        url: getContactsListQueryUrl,
        method: 'GET',
        data: {
            limit: limit,
            with: 'leads',
            page: page
        }
    }).fail(function (error) {
        console.error('Ошибка при получении контактов', error);
    });
}

function createTask(contactId) {
    $.ajax({
        url: setTaskQueryUrl,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            text: "Контакт без сделок",
            complete_till: Math.floor(Date.now() / 1000) + 86400,
            entity_id: contactId,
            entity_type: "contacts"
        })
    }).done(function () {
        console.log(`Задача для контакта с ID ${contactId} успешно создана.`);
    }).fail(function (error) {
        console.error(`Ошибка при создании задачи для контакта с ID ${contactId}.`, error);
    });
}

function addTaskToContacts(contacts) {
    contacts.forEach(function (contact) {
        if (!contact._embedded ||
            !contact._embedded.leads ||
            contact._embedded.leads.length === 0
        ) {
            createTask(contact.id);
        }
    });
}

function checkAllContacts() {

    function checkNextPage(page) {
        getContacts(page).done(function (data) {
            if (data && data._embedded && data._embedded.contacts.length > 0) {
                addTaskToContacts(data._embedded.contacts);
                page++;
                delay(rateDelay).then(function() {
                    checkNextPage(page);
                });
            } else {
                console.log('Все контакты обработаны.');
            }
        });
    }

    checkNextPage(page);
}

checkAllContacts();