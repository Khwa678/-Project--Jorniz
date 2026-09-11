using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

public partial class MasterPage : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        logout.ServerClick += new EventHandler(log_Click);

        if (!this.IsPostBack)
        {
            HttpCookie returnCookie = Request.Cookies["mygoacookie1"];
            if ((returnCookie == null) || string.IsNullOrEmpty(returnCookie.Value))
            {
                Response.Redirect("Default.aspx");
            }
            else
            {
                
            }
        }
    }
    protected void log_Click(object sender, EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
        {
            Response.Redirect("Default.aspx");
        }
        else
        {
            Response.Cookies["mygoacookie1"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("Default.aspx");
        }
    }
}
