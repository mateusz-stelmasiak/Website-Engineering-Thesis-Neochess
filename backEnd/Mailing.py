import smtplib, ssl
from email.message import EmailMessage
from email.utils import make_msgid
import mimetypes
import os
import base64
import qrcode
import io

class Mailing:
    def __init__(self):
        self.address = 'ToAdd'
        self.password = 'ToAdd'

    def SendWelcomeEmail(self, username, receiver_mail, otp_secret):
        msg = EmailMessage()
        msg['Subject'] = 'Witaj na NeoChess'
        msg['From'] = 'NeoChess <' + self.address + '>'
        msg['To'] = username + ' <' + receiver_mail + '>'
        msg.set_content('Zarejestrowałeś się na NeoChess. Zeskanuj poniższy kod QR w aplikacji Google Authenticator, aby generować kody autoryzujące logowanie.')
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

        img = qrcode.make(otp_secret)
        img_array = io.BytesIO()
        img.save(img_array, format='PNG')

        msg.get_payload()[1].add_related(img_arr.getvalue(), 
                                            maintype='PNG', 
                                            subtype='PNG', 
                                            cid=image_cid)

        context = ssl.create_default_context()

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(self.address, self.password)
            server.sendmail(self.address, receiver_mail, msg.as_string())