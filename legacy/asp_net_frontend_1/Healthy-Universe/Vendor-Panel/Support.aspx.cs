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
public partial class Vendor_Panel_Support : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {

        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        success.Style.Add("display", "none");
        failed.Style.Add("display", "none");
        if (!this.IsPostBack)
        {
            BindGrid();

         
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Sproviders WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                Label10.Text = reader["id"].ToString();

                reader.Close();
                connection.Close();
            }

        }
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        try
        {
            string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            SqlCommand cmd = new SqlCommand("Insert into Supports (Rquery,Dquery,Emailid,Status1,Regdate,status) values (@Rquery,@Dquery,@Emailid,@Status1,@Regdate,@status)", con);
            cmd.Parameters.AddWithValue("@Rquery", TextBox1.Text);
            cmd.Parameters.AddWithValue("@DQuery", TextBox2.Text);
            cmd.Parameters.AddWithValue("@Emailid", returnCookie1);
            cmd.Parameters.AddWithValue("@status1", "NOT ACTIVE");
            cmd.Parameters.AddWithValue("@Regdate", DateTime.Now.ToString());
            cmd.Parameters.AddWithValue("@status", "PENDING");
            if (con.State == ConnectionState.Closed)
            {
                con.Open();
            }
            cmd.Connection = con;
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            con.Close();

            success.Style.Add("display", "block");
        }
        catch
        {
            failed.Style.Add("display", "block");
        }

    }
    protected void BindGrid()
    {
        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Supports Where Email = @Email ", con);

            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Email", returnCookie1.Value);
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                grdImages.DataSource = dt;
                grdImages.DataBind();
                emptylist.Style.Add("display", "none");
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
                emptylist.Style.Add("display", "block");
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt.Clear();
            dt.Dispose();
            adp.Dispose();
        }
    }

}