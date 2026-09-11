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

public partial class Doctors_Dashboard_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack)
        {
            HttpCookie returnCookie1 = Request.Cookies["mygoacookie1122"];

            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Doctors WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                Label10.Text = reader["Name"].ToString();

                reader.Close();
                connection.Close();
            }
        }
    }

    //protected void Button1_Click(object sender, EventArgs e)
    //{
    //    Response.Redirect("Manage.aspx");
    //}

    //protected void Button2_Click(object sender, EventArgs e)
    //{
    //    Response.Redirect("Add-member.aspx");
    //}

    //protected void Button3_Click(object sender, EventArgs e)
    //{
    //    Response.Redirect("Manage.aspx");
    //}
}