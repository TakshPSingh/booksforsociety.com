const moment = require('moment-timezone');

var emailPickupConfirmation = (user, request, driver, sgMail) => {

    console.log("emailPickupConfirmation function called");
    var ref = request.ref;
    var timeInWords = moment(request.ATA).tz('Asia/Kolkata').format('hh:mm a z');
    var ETAInWords = moment(request.ETA).tz('Asia/Kolkata').format('hh:mm a z');
    var msg = {
        to: user.email,
        from: {
            name: 'booksforsociety.com',
            email: 'automatic@booksforsociety.com'
        },
        replyTo: 'taksh001@gmail.com',
        subject: `Pickup confirmation - Ref #${ref}`,
        text: "Your books were pickep up!",
        html: `<p>Dear ${user.name},</p>
        
        <p>Your books were successfully picked up:<p>

        <ul>
            <li>
                Address: ${request.address.full} (<a href="https://www.google.com/maps/search/?api=1&query=${request.address.location.latitude},${request.address.location.longitude}">map location</a>)
            </li>
            <li>
                Pickup expert: ${driver.name}
            </li>
            <li>
                Actual Pickup Time: ${timeInWords}
            </li>
            <li>
                Expected Pickup Time: ${ETAInWords}
            </li>
       </ul>
        <p>
        Congratulations on taking this significant step against fighting illiteracy!</p><p> Although you may not realize it, but your donation truly has the potential to change a kid's life.
        We are extremely proud of you for taking this initiative and hope that you keep donating books on our website.
        </p>
        <p>
        Regards,</p>
        <p>Taksh Pratap Singh</p>
        <a href="https://booksforsociety.com" target="_blank">booksforsociety.com
        </a>
        <p>
        For any questions or feedback, simply push the reply button and we will be happy to assist you.
        </p>
        `
    };
    console.log("msg created");
    return sgMail.send(msg);
    //email user and tell them that pickup has been completed
};

var emailAssignmentConfirmation = (user, request, driver, sgMail) => {
    console.log("emailAssignmentConfirmation function called");

    var ref = request.ref;
    var timeInWords = moment(request.ETA).tz('Asia/Kolkata').format('hh:mm a z');
    var msg = {
        to: user.email,
        from: {
            name: 'booksforsociety.com',
            email: 'automatic@booksforsociety.com'
        },
        replyTo: 'taksh001@gmail.com',
        subject: `Pickup Assigned - Ref #${ref}`,
        text: "Driver assigned for picking up your books",
        html: `<p>Dear ${user.name},</p>
        
        <p>We are sending our pickup expert ${driver.name} to your address: ${request.address.full} (<a href="https://www.google.com/maps/search/?api=1&query=${request.address.location.latitude},${request.address.location.longitude}">map location</a>).</p>

        <p>Please keep your books ready at <strong>${timeInWords}</strong>.</p>
        <p>
        Thank you for this donation. We look forward to receiving your books.
        </p>
        <p>
        Regards,</p>
        <p>Taksh Pratap Singh</p>
        <a href = "https://booksforsociety.com" target="_blank">booksforsociety.com
        </a>

        <p>
        For any questions or feedback, simply push the reply button and we will be happy to assist you.
        </p>
        `
    };
    return sgMail.send(msg);
    //email user to tell them a driver has been assigned to pickup their books
};

var emailToken = (user, sgMail) => {
    console.log("emailToken function called");
    var msg = {
        to: user.email,
        from: {
            name: 'booksforsociety.com',
            email: 'tokens@booksforsociety.com'
        },
        replyTo: 'taksh001@gmail.com',
        subject: 'Account Recovery Request',
        html: `<p>Dear ${user.name},</p>
        
        <p>We just received a request to recover your account. Please paste the following token on <a href="https://booksforsociety.com/verify.html">https://booksforsociety.com/verify.html</a> to reset your password:
        </p>
        
        <p>${user.tokens[0].token}</p>
        
        <p>If you did not make this request, do not worry. Your account is safe; no one take control of your account unless they have this token.<p>
        
        <p>The contents of this email are sensitive. Do not share this email or token with anyone.</p>

        <p>Regards,</p>
        <p>Taksh Pratap Singh</p>
        <p>Token Master</p>
        <a href = "https://booksforsociety.com" target="_blank">booksforsociety.com
        </a>

        <p>
        For any questions or feedback, simply push the reply button and we will be happy to assist you.
        </p>
        `
    };
    sgMail.send(msg);
};

module.exports = {emailPickupConfirmation, emailAssignmentConfirmation, emailToken}