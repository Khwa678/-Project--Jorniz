using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;
using System.IO;
using System.Text.RegularExpressions;
using System.Net;
using System.Net.Mail;


public class _Mail
{
	public static void SendMail(string EmailID, string Subject, string Message, string From)
    {
        try
        {
            MailMessage himail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient("relay-hosting.secureserver.net");
            himail.From = new MailAddress(From);
            himail.To.Add(EmailID);
            himail.Subject = Subject;
            himail.Body = Message;
            himail.IsBodyHtml = true;
            SmtpServer.Port = 25;
            SmtpServer.Credentials = new System.Net.NetworkCredential(From, "Secure@1234");
            SmtpServer.EnableSsl = false;
            SmtpServer.Send(himail);
        }
        catch (Exception ex)
        {

        }

    }
}
