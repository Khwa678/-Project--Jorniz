using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Web.Script.Serialization;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;

public partial class Contact : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        success.Style.Add("display", "none");
        error3.Style.Add("display", "none");
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            string From = "corporateemailservice@lyndata.com";
            string EmailID = "info@healthyuniverse.co.in";
            string Subject = "Automated: Support Query Received | Healthy Universe";
            string Message = "Name: " + TextBox1.Text + "<br/>Email Address:" + TextBox2.Text + "<br/>Subject:" + TextBox3.Text + "<br/>Message:" + TextBox4.Text;
            _Mail.SendMail(EmailID, Subject, Message, From);

            TextBox1.Text = string.Empty;
            TextBox2.Text = string.Empty;
            TextBox3.Text = string.Empty;
            TextBox4.Text = string.Empty;

            success.Style.Add("display", "block");
        }
        catch
        {
            error3.Style.Add("display", "block");
        }
    }
}