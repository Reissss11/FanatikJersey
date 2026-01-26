import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

# Sanitize password (remove quotes if present from .env)
password = os.getenv("MAIL_PASSWORD", "")
if password.startswith('"') and password.endswith('"'):
    password = password[1:-1]

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = password
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = 465
MAIL_SERVER = "smtp.gmail.com"

print(f"Email Service Configured for: {MAIL_USERNAME}")

async def send_reset_email(email: EmailStr, token: str):
    print(f"Preparing to send email to {email}...") 
    
    # Change this URL to your frontend URL
    reset_url = f"http://localhost:8000/reset-password?token={token}"
    
    html = f"""
    <h3>Recuperação de Palavra-passe</h3>
    <p>Recebeste este email porque pediste para recuperar a tua palavra-passe no FanatikJersey.</p>
    <p>Clica no link abaixo para criar uma nova palavra-passe:</p>
    <a href="{reset_url}">Recuperar Palavra-passe</a>
    <p>Se não foste tu, ignora este email.</p>
    """

    msg = MIMEMultipart()
    msg['From'] = f"FanatikJersey <{MAIL_FROM}>"
    msg['To'] = email
    msg['Subject'] = "FanatikJersey - Recuperação de Palavra-passe"
    msg.attach(MIMEText(html, 'html'))

    try:
        print("Connecting to SMTP server (SSL)...")
        # Use SMTP_SSL for port 465
        with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT) as server:
            print("Logging in...")
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            print("Sending email...")
            server.send_message(msg)
            print("Email sent successfully!")
            
    except Exception as e:
        print(f"Error sending email: {e}")
        raise e
