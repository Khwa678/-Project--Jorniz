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

public partial class Vendor_Panel_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
   
        if (!this.IsPostBack)
        {
            HttpCookie returnCookie111 = Request.Cookies["mygoacookie1"];

            SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            con1.Open();
            SqlCommand cmd1 = new SqlCommand("select count(Id) from Products Where Vid=@Vid", con1);
            cmd1.Parameters.Add("@Vid" , returnCookie111.Value);
            Int32 count1 = (Int32)cmd1.ExecuteScalar();
            con1.Close();
            Label8.Text = count1.ToString();

            con1.Open();
            SqlCommand cmd11 = new SqlCommand("select count(Id) from Tests Where Vid=@Vid", con1);
            cmd11.Parameters.Add("@Vid", returnCookie111.Value);
            Int32 count11 = (Int32)cmd11.ExecuteScalar();
            con1.Close();
            Label2.Text = count11.ToString();

            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Sproviders WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie111.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                Label10.Text = reader["Name"].ToString();

                reader.Close();
                connection.Close();
            }
        }
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        Response.Redirect("Products.aspx");
    }

    protected void Button2_Click(object sender, EventArgs e)
    {
        Response.Redirect("Products.aspx");
    }

    protected void Button3_Click(object sender, EventArgs e)
    {
        Response.Redirect("Manage.aspx");
    }
}