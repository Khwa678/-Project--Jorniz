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

public partial class System_Administrator_Service_Provider : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
        failed2.Style.Add("display", "none");

        if (!this.IsPostBack)
        {
            BindGrid();
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Servicecategory"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList3.DataSource = cmd.ExecuteReader();
                    DropDownList3.DataTextField = "Title";
                    DropDownList3.DataValueField = "Id";
                    DropDownList3.DataBind();
                    con.Close();
                }
            }
        }
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {


                string fileName1;
                string path1 = string.Empty;

                if (FileUpload1.HasFile)
                {
                    fileName1 = Guid.NewGuid() + FileUpload1.FileName;
                    FileUpload1.SaveAs(Server.MapPath("Doctors/") + fileName1);
                    path1 = "https://healthyuniverse.co.in/System-Administrator/Sproviders/" + fileName1;
                }
                else
                {
                    path1 = "https://healthyuniverse.co.in/System-Administrator/testpic2.jpg";
                }

                string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
                SqlCommand cmd = new SqlCommand("Insert into Sproviders (Name,Email,Contact,Businessname,Description,Serviceid,Address,City,State,Path1,Verification,Gstin,Panno,Servicename,Password,Status) values (@Name,@Email,@Contact,@Businessname,@Description,@Serviceid,@Address,@City,@State,@Path1,@Verification,@Gstin,@Panno,@Servicename,@Password,@Status)", con);
                cmd.Parameters.AddWithValue("@Name", TextBox2.Text);
                cmd.Parameters.AddWithValue("@Email", TextBox4.Text);
                cmd.Parameters.AddWithValue("@Contact", TextBox1.Text);

                cmd.Parameters.AddWithValue("@Businessname", TextBox6.Text);
                cmd.Parameters.AddWithValue("@Description", TextBox8.Text);
                cmd.Parameters.AddWithValue("@Serviceid", DropDownList3.SelectedItem.Value);

                cmd.Parameters.AddWithValue("@Address", TextBox3.Text);
                cmd.Parameters.AddWithValue("@City", TextBox5.Text);
                cmd.Parameters.AddWithValue("@State", DropDownList1.SelectedItem.Value);

                cmd.Parameters.AddWithValue("@Path1", path1);
                cmd.Parameters.AddWithValue("@Gstin", TextBox7.Text);
                cmd.Parameters.AddWithValue("@Panno", TextBox10.Text);
                cmd.Parameters.AddWithValue("@Verification", "1");
                cmd.Parameters.AddWithValue("@Servicename", DropDownList3.SelectedItem.Text);
                cmd.Parameters.AddWithValue("@Password", "Secure@1234");
                 cmd.Parameters.AddWithValue("@Status", "Active");

            if (con.State == ConnectionState.Closed)
                {
                    con.Open();
                }
                cmd.Connection = con;
                cmd.ExecuteNonQuery();
                cmd.Dispose();
                con.Close();

                BindGrid();

                TextBox1.Text = string.Empty;
                TextBox2.Text = string.Empty;
                TextBox3.Text = string.Empty;
                TextBox4.Text = string.Empty;
                TextBox5.Text = string.Empty;
                TextBox6.Text = string.Empty;
                TextBox7.Text = string.Empty;
                TextBox8.Text = string.Empty;
                DropDownList3.ClearSelection();
                DropDownList1.ClearSelection();
                TextBox10.Text = string.Empty;
                FileUpload1.Attributes.Clear();


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
            SqlCommand cmd = new SqlCommand("select * from Sproviders where status = @status ORDER BY Id DESC", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Status","Active");
            adp.Fill(dt);
            if (dt.Rows.Count > 0)
            {
                grdImages.DataSource = dt;
                grdImages.DataBind();

            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();

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
    protected void grdImages_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {

        try
        {
            //Get the Image_Id from the DataKeyNames
            int imgId = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value);
            SqlCommand cmd = new SqlCommand("delete from Sproviders where Id=@Id", con);
            cmd.Parameters.AddWithValue("@Id", imgId);
            cmd.CommandType = CommandType.Text;
            con.Open();
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            BindGrid();
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            con.Close();
        }
    }
    protected void OnRowEditing(object sender, GridViewEditEventArgs e)
    {
        grdImages.EditIndex = e.NewEditIndex;
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Sproviders WHERE Businessname like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox9.Text);
            adp1.Fill(dt1);
            if (dt1.Rows.Count > 0)
            {
                grdImages.DataSource = dt1;
                grdImages.DataBind();
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt1.Clear();
            dt1.Dispose();
            adp1.Dispose();
        }
    }
    protected void OnRowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        try
        {
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                int id = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value.ToString());

                TextBox txt1 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt1");
                FileUpload file = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("fuEditFile");

                string fileName = string.Empty;
                string newipath;

                if (file.HasFile)
                {
                    fileName = Guid.NewGuid() + file.FileName;
                    file.SaveAs(Server.MapPath("Sproviders/") + fileName);
                    newipath = "https://healthyuniverse.co.in/System-Administrator/Doctors/" + fileName;
                }
                else
                {
                    Label path1 = (Label)grdImages.Rows[e.RowIndex].FindControl("lblEditFile");
                    newipath = path1.Text;
                }

                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Sproviders set Businessname = @Businessname, Path1=@Path1 where Id=" + id, con1);
                cmd1.Parameters.AddWithValue("@Businessname", txt1.Text);
                cmd1.Parameters.AddWithValue("@Path1", newipath);
                cmd1.ExecuteNonQuery();
                con1.Close();

                grdImages.EditIndex = -1;
                DataTable dt1 = new DataTable();
                SqlDataAdapter adp1 = new SqlDataAdapter();
                try
                {
                    SqlCommand cmd = new SqlCommand("select * from Sproviders WHERE Businessname like '%' + @SearchText + '%' ORDER BY Id DESC", con);
                    adp1.SelectCommand = cmd;
                    cmd.Parameters.Add("@SearchText", TextBox9.Text);
                    adp1.Fill(dt1);
                    if (dt1.Rows.Count > 0)
                    {
                        grdImages.DataSource = dt1;
                        grdImages.DataBind();
                    }
                    else
                    {
                        grdImages.DataSource = null;
                        grdImages.DataBind();
                    }
                }
                catch (Exception ex)
                {
                    ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
                }
                finally
                {
                    dt1.Clear();
                    dt1.Dispose();
                    adp1.Dispose();
                }
            }
        }
        catch
        {
        }

    }
    protected void OnRowCancelingEdit(object sender, EventArgs e)
    {
        grdImages.EditIndex = -1;
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Sproviders WHERE Businessname like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox9.Text);
            adp1.Fill(dt1);
            if (dt1.Rows.Count > 0)
            {
                grdImages.DataSource = dt1;
                grdImages.DataBind();
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt1.Clear();
            dt1.Dispose();
            adp1.Dispose();
        }
    }
    protected void Button5_Click(object sender, EventArgs e)
    {
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Sproviders WHERE Businessname like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox9.Text);
            adp1.Fill(dt1);
            if (dt1.Rows.Count > 0)
            {
                grdImages.DataSource = dt1;
                grdImages.DataBind();
            }
            else
            {
                grdImages.DataSource = null;
                grdImages.DataBind();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Message", "alert('Error occured : " + ex.Message.ToString() + "');", true);
        }
        finally
        {
            dt1.Clear();
            dt1.Dispose();
            adp1.Dispose();
        }
    }
}