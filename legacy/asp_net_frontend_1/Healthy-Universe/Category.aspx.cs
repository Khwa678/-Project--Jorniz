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
using System.Collections.Generic;
using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;
using System.IO;
using System.Net;
using System.Text;
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
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Net;

public partial class Category : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
      
        if (!this.IsPostBack)
        {
            BindData1();


        }
    }
    protected void BindData1()
    {
        try
        { 
        string categoryid = Request.QueryString["categoryid"];
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection conn = new SqlConnection(constring);
        DataSet ds = new DataSet();
        DataTable FromTable = new DataTable();
        conn.Open();
        string cmdstr = "Select * From Subcategory Where Categoryid = @categoryid";
        SqlCommand cmd = new SqlCommand(cmdstr, conn);
        cmd.Parameters.Add("@Categoryid", categoryid);
        SqlDataAdapter adp = new SqlDataAdapter(cmd);
        adp.Fill(ds);
        Repeater3.DataSource = ds.Tables[0];
        Repeater3.DataBind();
        conn.Close();



        }
        catch
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection conn = new SqlConnection(constring);
            DataSet ds = new DataSet();
            DataTable FromTable = new DataTable();
            conn.Open();
            string cmdstr = "Select * From Subcategory ";
            SqlCommand cmd = new SqlCommand(cmdstr, conn);
            SqlDataAdapter adp = new SqlDataAdapter(cmd);
            adp.Fill(ds);
            Repeater3.DataSource = ds.Tables[0];
            Repeater3.DataBind();
            conn.Close();
        }
    }
}