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
using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;
using System.Text;
using System.Security.Cryptography;
using System.Collections;
using System.Xml.Linq;

public partial class Vendor_Panel_MasterPage2 : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        logout.ServerClick += new EventHandler(log_Click);

        if (!this.IsPostBack)
        {
            HttpCookie returnCookie1x = Request.Cookies["mygoacookie1"];
            if ((returnCookie1x == null) || string.IsNullOrEmpty(returnCookie1x.Value))
            {
                Response.Redirect("Logged-Out.aspx");
            }
            else
            {

            }
        }
    }
    protected void log_Click(object sender, EventArgs e)
    {
        HttpCookie returnCookie1x = Request.Cookies["mygoacookie1"];
        if ((returnCookie1x == null) || string.IsNullOrEmpty(returnCookie1x.Value))
        {
            Response.Redirect("Logged-Out.aspx");
        }
        else
        {
            Response.Cookies["mygoacookie1"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("Logged-Out.aspx");
        }
    }
}
