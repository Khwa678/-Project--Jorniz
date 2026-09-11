using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Vendor_Panel_Account_Suspended : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        HttpCookie returnCookiex = Request.Cookies["mygoacookie1x"];
        if ((returnCookiex == null) || string.IsNullOrEmpty(returnCookiex.Value))
        {
            Response.Redirect("https://Healthy Universe.in/login.aspx");
        }
        else
        {
            Response.Cookies["mygoacookie1x"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("https://Healthy Universe.in/login.aspx");
        }
    }
}