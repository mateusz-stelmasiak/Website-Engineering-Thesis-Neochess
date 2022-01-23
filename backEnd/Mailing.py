import io
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import make_msgid

import qrcode


class Mailing:
    def __init__(self):
        self.address = 'chessdefender2137@gmail.com'
        self.password = '$erek!@3'
        self.qr_code = None

    def get_qr_code(self, otp_secret):
        img = qrcode.make(otp_secret)
        img_array = io.BytesIO()
        img.save(img_array, format='PNG')

        self.qr_code = img_array.getvalue()

        return self.qr_code if self.qr_code is not None else None

    def __send_email(self, receiver_mail, msg):
        context = ssl.create_default_context()

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(self.address, self.password)
            server.sendmail(self.address, receiver_mail, msg.as_string())

    def send_welcome_message(self, username, receiver_mail, confirmation_url):
        cid = make_msgid()
        msg = EmailMessage()
        msg['Subject'] = 'Witaj na NeoChess'
        msg['From'] = 'NeoChess <' + self.address + '>'
        msg['To'] = f"{username} <{receiver_mail}>"
        msg.set_content(
            f"Podany adres email został użyty podczas zakładania nowego konta dla użytkownika: {username}"
        )
        msg.add_alternative("""\
        <html lang="pl-PL">
<head>
    <meta charset="utf-8"/>
</head>

<body>
<div style="background-color:#f8f8f8; height: 30"></div>
<div style="margin:0;padding:0!important;background-color:#f8f8f8" width="100%">
    <center style="width:100%">
        <div style="max-width:600px;margin:0 auto">
            <font face="Verdana">
                <table width="600" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
                       style="background-color: #1d1d1d; max-width:600px;width:100%;margin:auto;border-spacing:0!important;border-collapse:collapse!important;">

                    <tbody>
                    <tr>
                        <td align="right" valign="center"
                            style="color:#dee3e6;font-weight: bold; font-size:1.3rem; padding:10px 20px;background: linear-gradient(45deg, #b058c5 15%, #743eac 100%); height:100px;
                                    ">
                            <span style="filter: drop-shadow(0 0 0.2rem #dee3e6);">NeoChess</span>
                        </td>
                    </tr>
                    <td height="10">&nbsp;</td>
                    <tr>
                        <td valign="top" style="padding: 10px 20px 0px 20px;">
                            <h1 style="color:#97bbe8; font-size: 17pt;margin-bottom: 0px;">Welcome to NeoChess!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" valign="top"
                            style="padding:0px 20px;  text-align: justify; text-justify: inter-word;color:#dee3e6">
                            Thank you for registering on NeoChess. Before we get started, we just need to confirm that this is you.
                            Click below to verify your email address.
                        </td>
                    </tr>
                    <td height="30px">&nbsp;</td>

                    <tr>
                        <td align="center" valign="top" style="padding:20px 0">
                            <h2 style="color:#97bbe8">Click to confirm your email</h2>
                            <a href="""+confirmation_url+"""
                               style=" background-color: #743eac;border-radius: 10px;color: white; padding: 15px 40px;text-align: center; text-decoration: none; display: inline-block; margin: 4px 2px;cursor: pointer">
                                <b>Confirm email</b>
                            </a>
                        </td>
                    </tr>


                    <td height="250">&nbsp;</td>
                    <tr>
                        <td align="center" valign="top" style="padding:20px 0;background-color:#191919;color:#dee3e6;font-size:0.9rem ">
                           This message was sent by <br> <b>NeoChess</b>
                        </td>
                    </tr>

                    </tbody>
                </table>
            </font>
        </div>
</div>
</center>
</div>
<div style="background-color:#f8f8f8; height: 30"></div>
</body>

</html>
            """.format(cid=cid[1:-1]), subtype='html')

        self.__send_email(receiver_mail, msg)

    def send_reset_password_token(self, username, receiver_mail, url):
        cid = make_msgid()
        msg = EmailMessage()
        msg['Subject'] = 'Resetowanie hasła do konta'
        msg['From'] = 'NeoChess <' + self.address + '>'
        msg['To'] = f"{username} <{receiver_mail}>"
        msg.set_content(
            f"Podany adres email został podany podczas resetowania hasła do konta o nazwie użytkownika: {username}"
        )
        msg.add_alternative("""\
            <html>
                <body>
                    <p>
                        <h1>Zarejestrowałeś się na NeoChess.</h1><br>
                        W celu ustawienia nowego hasła do konta, kliknij w poniższy link
                        <p><a href=""" + url + """>""" + url + """</a></p>
                    </p>
                </body>
            </html>
            """.format(cid=cid[1:-1]), subtype='html')

        self.__send_email(receiver_mail, msg)

    def send_qr_code(self, username, receiver_mail, otp_secret):
        msg = EmailMessage()
        msg['Subject'] = 'Witaj na NeoChess'
        msg['From'] = 'NeoChess <' + self.address + '>'
        msg['To'] = f"{username} <{receiver_mail}>"
        msg.set_content(
            'Zarejestrowałeś się na NeoChess. Zeskanuj poniższy kod QR w aplikacji Google Authenticator, '
            'aby generować kody autoryzujące logowanie.'
        )
        image_cid = make_msgid(domain='chess-defence.ddns.net')
        msg.add_alternative("""\
            <html>
                <body>
                    <p>
                        <h1>Zarejestrowałeś się na NeoChess.</h1><br>
                        Zeskanuj poniższy kod w aplikacji Google Authenticator, aby generować kody autoryzujące logowanie.
                    </p>
                    <img src="cid:{image_cid}">
                </body>
            </html>
            """.format(image_cid=image_cid[1:-1]), subtype='html')

        msg.get_payload()[1].add_related(self.get_qr_code(otp_secret),
                                         maintype='PNG',
                                         subtype='PNG',
                                         cid=image_cid)

        self.__send_email(receiver_mail, msg)
