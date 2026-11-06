from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import os, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

router = APIRouter(tags=["email"])

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT"))
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS") == "True"

class EmailSchema(BaseModel):
    to_email: str
    subject: str
    body: str

@router.post("/send-email/")
async def send_email(email: EmailSchema):
    try:
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        if MAIL_STARTTLS:
            server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        msg = MIMEMultipart()
        msg['From'] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
        msg['To'] = email.to_email
        msg['Subject'] = email.subject
        msg.attach(MIMEText(email.body, 'plain'))
        server.sendmail(MAIL_FROM, email.to_email, msg.as_string())
        server.quit()
        return {"message": f"Email envoyé à {email.to_email}"}
    except Exception as e:
        return {"error": str(e)}
