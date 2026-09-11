using System;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
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
using System.Text;

public partial class Registration : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        success.Style.Add("display", "none");
        failed2.Style.Add("display", "none");
        failed.Style.Add("display", "none");
        if (!this.IsPostBack)
        {
            //BindGrid();
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList2.DataSource = cmd.ExecuteReader();
                    DropDownList2.DataTextField = "Title";
                    DropDownList2.DataValueField = "Id";
                    DropDownList2.DataBind();
                    con.Close();
                }
            }
        }
    }

    //protected void LinkButton111_Click(object sender, EventArgs e)
    //{
    //    try
    //    {
    //        string From = "corporateemailservice@lyndata.com";
    //        string EmailID = "Info@vconnectyoudigitally.com";
    //        string Subject = "Automated: Seller's device Information | Vconnect store";
    //        string Message = "Device brand: " + TextBox1.Text + "<br/>Device Name:" + TextBox2.Text + "<br/>Storage / Ram:" + TextBox5.Text + "<br/>Device Age:" + DropDownList1.SelectedItem.Text + "<br/>Device Screen:" + DropDownList2.SelectedItem.Text + "<br/>Device Repair:" + DropDownList4.SelectedItem.Text + "<br/>Accessories:" + DropDownList5.SelectedItem.Text + "<br/>Device Body:" + DropDownList6.SelectedItem.Text + "<br/>Any issue:" + TextBox5.Text;
    //        _Mail.SendMail(EmailID, Subject, Message, From);

    //        TextBox1.Text = string.Empty;
    //        TextBox2.Text = string.Empty;
    //        TextBox5.Text = string.Empty;
    //        TextBox4.Text = string.Empty;
    //        DropDownList1.ClearSelection();
    //        DropDownList2.ClearSelection();
    //        DropDownList4.ClearSelection();
    //        DropDownList5.ClearSelection();
    //        DropDownList6.ClearSelection();

    //        success.Style.Add("display", "block");
    //    }
    //    catch
    //    {
    //        error3.Style.Add("display", "block");
    //    }
    //}


    protected void Button1_Click(object sender, EventArgs e)
    {

        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con1 = new SqlConnection(constring);
        SqlCommand cmd1 = new SqlCommand("Select Email from Sproviders where Email=@Email", con1);
        cmd1.Parameters.AddWithValue("@Email", this.TextBox3.Text);
        con1.Open();
        SqlDataReader dr = cmd1.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                Response.Write(@"<script language='javascript'>alert('Email address already Exists.')</script>");
                con.Close();
            }
        }
    
        else
        {
            con1.Close();

            try
            {
                con.Close();
                string fileName1;
                string path1 = string.Empty;

                if (FileUpload1.HasFile)
                {
                    fileName1 = Guid.NewGuid() + FileUpload1.FileName;
                    FileUpload1.SaveAs(Server.MapPath("Uploads/") + fileName1);
                    path1 = "https://healthyuniverse.co.in/Uploads/" + fileName1;
                }
                else
                {
                    path1 = "https://healthyuniverse.co.in/testpic2.jpg";
                }

        
                SqlCommand cmd = new SqlCommand("Insert into Sproviders (Name,Email,Contact,Businessname,Description,Serviceid,Address,City,State,Path1,Verification,Gstin,Panno,Servicename,Password,Status) values (@Name,@Email,@Contact,@Businessname,@Description,@Serviceid,@Address,@City,@State,@Path1,@Verification,@Gstin,@Panno,@Servicename,@Password,@Status)", con);
                cmd.Parameters.AddWithValue("@Name", TextBox1.Text);
                cmd.Parameters.AddWithValue("@Email", TextBox3.Text);
                cmd.Parameters.AddWithValue("@Contact", TextBox2.Text);
                cmd.Parameters.AddWithValue("@Businessname", TextBox4.Text);
                cmd.Parameters.AddWithValue("@Description", TextBox5.Text);
                cmd.Parameters.AddWithValue("@Serviceid", DropDownList2.SelectedItem.Value);
                cmd.Parameters.AddWithValue("@Address", TextBox6.Text);
                cmd.Parameters.AddWithValue("@City", TextBox5.Text);
                cmd.Parameters.AddWithValue("@State", DropDownList1.SelectedItem.Value);
                cmd.Parameters.AddWithValue("@Path1", path1);
                cmd.Parameters.AddWithValue("@Gstin", TextBox8.Text);
                cmd.Parameters.AddWithValue("@Panno", TextBox10.Text);
                cmd.Parameters.AddWithValue("@Verification", "1");
                cmd.Parameters.AddWithValue("@Servicename", DropDownList2.SelectedItem.Text);
                cmd.Parameters.AddWithValue("@Password", TextBox9.Text);
                cmd.Parameters.AddWithValue("@Status", "PENDING");

                if (con.State == ConnectionState.Closed)
                {
                    con.Open();
                }
                cmd.Connection = con;
                cmd.ExecuteNonQuery();
                cmd.Dispose();
                con.Close();


                TextBox1.Text = string.Empty;
                TextBox2.Text = string.Empty;
                TextBox3.Text = string.Empty;
                TextBox4.Text = string.Empty;
                TextBox5.Text = string.Empty;
                TextBox6.Text = string.Empty;
                TextBox7.Text = string.Empty;
                TextBox8.Text = string.Empty;
                DropDownList2.ClearSelection();
                DropDownList1.ClearSelection();
                TextBox10.Text = string.Empty;
                FileUpload1.Attributes.Clear();

                success.Style.Add("display", "block");
            }
            catch
            {
                failed.Style.Add("display", "block");
            }
        }
    }
}