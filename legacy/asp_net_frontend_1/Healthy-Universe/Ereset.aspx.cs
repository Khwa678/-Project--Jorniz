using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Security;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections.Specialized;
using System.Text;
using System.Security.Cryptography;
using System.Net;
using System.Net.Mail;

public partial class Ereset : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        error1.Style.Add("display", "none");
        error2.Style.Add("display", "none");
        error3.Style.Add("display", "none");
        error5.Style.Add("display", "none");
        success.Style.Add("display", "none");

    }

    protected void Button3_Click(object sender, EventArgs e)
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        SqlCommand cmd = new SqlCommand("Select Email from Sproviders where Email= @Email", con);
        cmd.Parameters.AddWithValue("@Email", TextBox1f.Text);
        con.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                con.Close();
                try
                {
                    string flink = "https://healthyuniverse.co.in/Vreset.aspx?a1=" + HttpUtility.UrlEncode(Encrypt(TextBox1f.Text.Trim()));
                    string body = this.PopulateBody(flink);
                    this.SendHtmlFormattedEmail(TextBox1f.Text, "Reset Your Password | Account Recovery | Healthy Universe", body);
                    success.Style.Add("display", "block");
                }
                catch
                {
                    error1.Style.Add("display", "none");
                    error2.Style.Add("display", "none");
                    error3.Style.Add("display", "block");
                    error5.Style.Add("display", "none");
                }
            }
        }
        else
        {
            error1.Style.Add("display", "none");
            error2.Style.Add("display", "none");
            error3.Style.Add("display", "none");
            error5.Style.Add("display", "block");
        }




    }
    private string Encrypt(string clearText)
    {
        string EncryptionKey = "MAKV2SPBNI99212";
        byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
        using (Aes encryptor = Aes.Create())
        {
            Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
            encryptor.Key = pdb.GetBytes(32);
            encryptor.IV = pdb.GetBytes(16);
            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(clearBytes, 0, clearBytes.Length);
                    cs.Close();
                }
                clearText = Convert.ToBase64String(ms.ToArray());
            }
        }
        return clearText;
    }
    private string PopulateBody(string url)
    {
        string body = string.Empty;
        using (StreamReader reader = new StreamReader(Server.MapPath("~/Reset.html")))
        {
            body = reader.ReadToEnd();
        }
        body = body.Replace("{Url}", url);
        return body;
    }
    private void SendHtmlFormattedEmail(string recepientEmail, string subject, string body)
    {
        using (MailMessage mailMessage = new MailMessage())
        {
            mailMessage.From = new MailAddress(ConfigurationManager.AppSettings["UserName"]);
            mailMessage.Subject = subject;
            mailMessage.Body = body;
            mailMessage.IsBodyHtml = true;
            mailMessage.To.Add(new MailAddress(recepientEmail));
            SmtpClient smtp = new SmtpClient();
            smtp.Host = ConfigurationManager.AppSettings["Host"];
            smtp.EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableSsl"]);
            System.Net.NetworkCredential NetworkCred = new System.Net.NetworkCredential();
            NetworkCred.UserName = ConfigurationManager.AppSettings["UserName"];
            NetworkCred.Password = ConfigurationManager.AppSettings["Password"];
            smtp.UseDefaultCredentials = true;
            smtp.Credentials = NetworkCred;
            smtp.Port = int.Parse(ConfigurationManager.AppSettings["Port"]);
            smtp.Send(mailMessage);
        }
    }
}