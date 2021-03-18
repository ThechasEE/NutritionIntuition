import React from 'react';
import LoginRegister from '../components/LoginRegister';
import './LoginRegisterPage.css';

// Media
import background from '../media/background.mp4';

const LoginRegisterPage = () =>
{
    return(
        <body>
            <section class='container'>
                <LoginRegister />
            </section>

            <video src={background} loop autoPlay muted>Your browser does not support the video tag.</video>
        </body>
    );
};

export default LoginRegisterPage;