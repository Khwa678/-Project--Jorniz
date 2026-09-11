using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Drawing;

public partial class Member_Dashboard : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
        if (!this.IsPostBack)
        {
            BindGrid();
        }
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            SqlCommand cmd = new SqlCommand("Insert into Membersdt (Name,Email,Contact,Password,Status,Regdate) values (@Name,@Email,@Contact,@Password,@Status,@Regdate)", con);
            cmd.Parameters.AddWithValue("@Name", TextBox1.Text);
            cmd.Parameters.AddWithValue("@Email", TextBox2.Text);
            cmd.Parameters.AddWithValue("@Contact", TextBox3.Text);
            cmd.Parameters.AddWithValue("@Fathername", TextBox4.Text);
            cmd.Parameters.AddWithValue("@Dob", TextBox5.Text);
            cmd.Parameters.AddWithValue("@Gender", DropDownList1.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@State", DropDownList2.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@City", TextBox6.Text);
            cmd.Parameters.AddWithValue("@Pincode", TextBox10.Text);
            cmd.Parameters.AddWithValue("@Houseno", TextBox8.Text);
            cmd.Parameters.AddWithValue("@Address", TextBox9.Text);
            cmd.Parameters.AddWithValue("@Landmark", TextBox10.Text);
            cmd.Parameters.AddWithValue("@status", "NOT ACTIVE");
            cmd.Parameters.AddWithValue("@Regdate", DateTime.Now.ToString());
            if (con.State == ConnectionState.Closed)
            {
                con.Open();
            }
            cmd.Connection = con;
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            con.Close();
            //BindGrid();
            TextBox1.Text = string.Empty;
            TextBox2.Text = string.Empty;
            TextBox3.Text = string.Empty;
            TextBox4.Text = string.Empty;
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }
    protected void BindGrid()
    {

        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Membersdt ORDER BY Id DESC", con);
            adp.SelectCommand = cmd;
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