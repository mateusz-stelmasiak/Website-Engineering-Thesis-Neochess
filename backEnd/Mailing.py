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
        msg = EmailMessage()
        msg['Subject'] = 'Witaj na NeoChess'
        msg['From'] = 'NeoChess <' + self.address + '>'
        msg['To'] = f"{username} <{receiver_mail}>"
        msg.set_content(
            f"Podany adres email został użyty podczas zakładania nowego konta dla użytkownika: {username}"
        )
        msg.add_alternative("""\
            <html>
                <body>
                    <p>
                        <h1>Zarejestrowałeś się na NeoChess.</h1><br>
                        W celu potwierdzenia konta udaj się w poniższy link
                        <p><a href="{{ confirmation_url }}">{{ """ + confirmation_url + """ }}</a></p>
                    </p>
                </body>
            </html>
            """.format(subtype='html'))

        self.__send_email(receiver_mail, msg)

    def send_reset_password_token(self, username, receiver_mail, url):
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
                        <p><a href="{{ confirmation_url }}">{{ """ + url + """ }}</a></p>
                    </p>
                </body>
            </html>
            """.format(subtype='html'))

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
