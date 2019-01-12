var emailPickupConfirmation = (user) => {
    return Promise.resolve();
    //email user and tell them that pickup has been completed
};

var emailAssignmentConfirmation = (user) => {
    //email user to tell them a driver has been assigned to pickup their books
};

module.exports = {emailPickupConfirmation, emailAssignmentConfirmation}