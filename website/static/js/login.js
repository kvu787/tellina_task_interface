$(document).ready(function () {
    var user_id = -1;

    $('#new-user-registration').click(function() {
        BootstrapDialog.show({
            title: "Please register with your first and last names:",
            message: $('<div class="modal-body">'
                      +  '<form role="form">'
                      + '<div class="form-group">'
                      +    '<input type="first_name" class="form-control"'
                      +    'id="inputFirstName" placeholder="First Name"/>'
                      + '</div>'
                      + '<div class="form-group">'
                      +    '<input type="last_name" class="form-control"'
                      +        'id="inputLastName" placeholder="Last Name"/>'
                      + '</div>'
                      + '<span id="notification"></span>'
                      + '</form></div>'),
            modal:true,
            buttons: [{
                label: "Submit",
                cssClass: "btn-primary",
                action: function(dialogItself) {
                    var first_name = $('#inputFirstName').val();
                    var last_name = $('#inputLastName').val();

                    if (first_name.length === 0) {
                        $('#notification').text("Please don't leave first name empty.");
                    } else if (last_name.length === 0) {
                        $('#notification').text("Please don't leave last name empty.");
                    } else {
                        // register user in the backend
                        $.ajax({type: "GET",
                                url: "register_user",
                                data: {"first_name": first_name, "last_name": last_name},
                                error: function(request, status, error) {
                                    alert("Sorry, we caught an error: " + error + ". Please wait for a few seconds and try again.");
                                },
                                success: function(data) {
                                    var username = data.access_code;
                                    if (username == 'USER_EXISTS') {
                                        BootstrapDialog.show({
                                            title: "Registration Error",
                                            message: "User " + first_name + " " + last_name + " already exists. Did you forget your access code?",
                                            buttons: [{
                                                label: "Got it",
                                                cssClass: "btn-primary",
                                                action: function(dialogItself) {
                                                    dialogItself.close();
                                                }
                                            }]
                                        });
                                        console.log("User already exists.");
                                    } else {
                                        console.log(data.group);
                                        BootstrapDialog.show({
                                            title: "Login Information",
                                            message: "Your access code: <b>" + username + "</b>",
                                            buttons: [{
                                                label: "Got it",
                                                cssClass: "btn-primary",
                                                action: function(dialogItself) {
                                                    dialogItself.close();
                                                }
                                            }]
                                        });
                                        console.log("User " + username + " created.");
                                    }
                                }
                        });
                        dialogItself.close()
                    }
                }
            }]
        });
        return false;
    });

    $('#user-log-in').click(function() {
        var username = $('#username').val();
        if (username.length > 0) {
            $.get(`user_login`, {access_code: username, check_existing_session: true}, function(data) {
                if (data.status == "RUNNING_STUDY_SESSION_FOUND") {
                    BootstrapDialog.show({
                        title: "Running study session found",
                        message: "We found that you have a previous study session which is not completed. Would you like to resume that session?",
                        buttons: [
                        {
                            label: "Yes, resume",
                            cssClass: "btn-primary",
                            action: function(dialogItself) {
                                dialogItself.close();
                                // redirect user into the session
                                $.get(`/resume_task_session`, {task_session_id: data.task_session_id}, function(data) {
                                    window.location.replace(data.task_session_id);
                                });
                            }
                        },
                        {
                            label: "No, create a new session",
                            cssClass: "btn-primary",
                            action: function(dialogItself) {
                                dialogItself.close();
                                // redirect user to the consent page
                                window.location.replace('consent');
                                $.get(`/user_login`, {access_code: username, check_existing_session: false}, function(data){
                                    // set up task session in the backend
                                })
                            }
                        }]
                    });
                    console.log(data.status)
                } else if (data.status == "SESSION_CREATED") {
                    console.log(data.task_session_id);
                    // redirect user into the session
                    window.location.replace('consent');
                } else if (data.status == "USER_DOES_NOT_EXIST") {
                    BootstrapDialog.show({
                        message: "User " + username + " does not exist. Please make sure the username is correct.",
                        buttons: [{
                            label: "Retry",
                            cssClass: "btn-primary",
                            action: function(dialogItself) {
                                dialogItself.close();
                            }
                        }]
                    });
                } else if (data.status == "TASK_SESSION_CREATION_FAILED") {
                    BootstrapDialog.show({
                        message: "Task session creation failed. Please try a few seconds later.",
                        buttons: [{
                            label: "Retry",
                            cssClass: "btn-primary",
                            action: function(dialogItself) {
                                dialogItself.close();
                            }
                        }]
                    });
                }
            });
        }
        return false;
    });

    $('#forget-access-code').click(function() {
        BootstrapDialog.show({
            title: "You may retrieve access code with your first name and last name:",
            message: $('<div class="modal-body">'
                      +  '<form role="form">'
                      + '<div class="form-group">'
                      +    '<input type="first_name" class="form-control"'
                      +    'id="inputFirstName" placeholder="First Name"/>'
                      + '</div>'
                      + '<div class="form-group">'
                      +    '<input type="last_name" class="form-control"'
                      +        'id="inputLastName" placeholder="Last Name"/>'
                      + '</div>'
                      + '<span id="notification"></span>'
                      + '</form></div>'),
            modal:true,
            buttons: [{
                label: "Submit",
                cssClass: "btn-primary",
                action: function(dialogItself) {
                    var first_name = $('#inputFirstName').val();
                    var last_name = $('#inputLastName').val();
                    if (first_name.length === 0) {
                        $('#notification').text("Please don't leave first name empty.");
                    } else if (last_name.length === 0) {
                        $('#notification').text("Please don't leave last name empty.");
                    } else {
                        $.getJSON("retrieve_access_code", {first_name: first_name, last_name: last_name}, function(data) {
                            var username = data.access_code
                            if (username == "USER_DOES_NOT_EXIST") {
                                BootstrapDialog.show({
                                    title: "Error retrieving access code",
                                    message: 'User "' + first_name + ' ' + last_name + '" not found. Please make sure your '
                                            + 'spelling is correct. If you continue to have this problem, email '
                                            + '<it>xilin@uw.edu</it>.',
                                    buttons: [{
                                        label: "Got it",
                                        cssClass: "btn-primary",
                                        action: function(dialogItself) {
                                            dialogItself.close();
                                        }
                                    }]
                                });
                            } else {
                                BootstrapDialog.show({
                                    title: "Login Information",
                                    message: "Your access code is <b>" + username + "</b>",
                                    buttons: [{
                                        label: "Got it",
                                        cssClass: "btn-primary",
                                        action: function(dialogItself) {
                                            dialogItself.close();
                                        }
                                    }]
                                });
                            }
                        });
                        dialogItself.close()
                    }
                }
            }]
        });
        return false;
    });
});