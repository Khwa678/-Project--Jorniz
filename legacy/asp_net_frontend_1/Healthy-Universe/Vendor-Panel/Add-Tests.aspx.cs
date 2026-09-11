using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;


public partial class Vendor_Panel_Add_Tests : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
        success.Style.Add("display", "none");
        if (!this.IsPostBack)
        {
            HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
            BindGrid1();
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM LDepartments"))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList1.DataSource = cmd.ExecuteReader();
                    DropDownList1.DataTextField = "Title";
                    DropDownList1.DataValueField = "Id";
                    DropDownList1.DataBind();
                    con.Close();
                }
            }
            DropDownList1.Items.Insert(0, new ListItem("--Select Department--", "0"));

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

                Label3.Text = reader["Id"].ToString();

                reader.Close();
                connection.Close();
            }

        }
    }
    protected void BindGrid1()
    {
        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        DataTable dt = new DataTable();
        SqlDataAdapter adp = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Tests Where Vid=@Vid", con);
            adp.SelectCommand = cmd;
            cmd.Parameters.Add("@Vid", returnCookie1.Value);
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
            SqlCommand cmd = new SqlCommand("delete from Tests where Id=@Id", con);
            cmd.Parameters.AddWithValue("@Id", imgId);
            cmd.CommandType = CommandType.Text;
            con.Open();
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            BindGrid1();
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

    protected void Button1_Click(object sender, EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
        try
        {
            string fileName1;
            string path1 = string.Empty;


            string fileName4;
            string path4 = string.Empty;

            string fileName5;
            string path5 = string.Empty;



            if (FileUpload1.HasFile)
            {
                fileName1 = Guid.NewGuid() + FileUpload1.FileName;
                FileUpload1.SaveAs(Server.MapPath("Uploads/") + fileName1);
                path1 = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName1;
            }
            else
            {
                path1 = "https://healthyuniverse.co.in/Vendor-Panel/testpic1.jpg";
            }


            if (FileUpload4.HasFile)
            {
                fileName4 = Guid.NewGuid() + FileUpload4.FileName;
                FileUpload4.SaveAs(Server.MapPath("Uploads/") + fileName4);
                path4 = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName4;
            }
            else
            {
                path4 = "https://healthyuniverse.co.in/Vendor-Panel/testpic1.jpg";
            }

            //if (FileUpload5.HasFile)
            //{
            //    fileName5 = Guid.NewGuid() + FileUpload5.FileName;
            //    FileUpload5.SaveAs(Server.MapPath("Uploads/") + fileName5);
            //    path5 = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName5;
            //}
            //else
            //{
            //    path5 = "https://healthyuniverse.co.in/Vendor-Panel/testpic1.jpg";
            //}


            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            SqlCommand cmd = new SqlCommand("Insert into Tests (Title,Description,Quantity,categoryid,Categoryname,Price,Price1,Path1,IsSelected,Weight,Path3,Dtag,Ktag,Status,Vid,Vid1) values (@Title,@Description,@Quantity,@categoryid,@Categoryname,@Price,@Price1,@Path1,@IsSelected,@Weight,@Path3,@Dtag,@Ktag,@Status,@Vid,@Vid1)", con);
            cmd.Parameters.AddWithValue("@Title", TextBox2.Text);
            cmd.Parameters.AddWithValue("@Description", TextBox4.Text);
            cmd.Parameters.AddWithValue("@Quantity", DropDownList3.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@categoryid", DropDownList1.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@categoryname", DropDownList1.SelectedItem.Text);
            cmd.Parameters.AddWithValue("@Price", TextBox6.Text);
            cmd.Parameters.AddWithValue("@Price1", TextBox8.Text);
            cmd.Parameters.AddWithValue("@Path1", path1);
            cmd.Parameters.AddWithValue("@Path3", path4);          
            cmd.Parameters.AddWithValue("@IsSelected", 0);
            cmd.Parameters.AddWithValue("@Weight", TextBox1.Text);
            cmd.Parameters.AddWithValue("@Dtag", TextBox3.Text);
            cmd.Parameters.AddWithValue("@Ktag", TextBox5.Text);          
            cmd.Parameters.AddWithValue("@Status", "Pending");
            cmd.Parameters.AddWithValue("@Vid", returnCookie1.Value);
            cmd.Parameters.AddWithValue("@vid1", Label3.Text);
            if (con.State == ConnectionState.Closed)
            {
                con.Open();
            }
            cmd.Connection = con;
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            con.Close();
            BindGrid1();
            TextBox2.Text = string.Empty;
            TextBox4.Text = string.Empty;
            TextBox6.Text = string.Empty;
            TextBox8.Text = string.Empty;
            DropDownList3.ClearSelection();
            TextBox1.Text = string.Empty;        

            FileUpload1.Attributes.Clear();

            FileUpload4.Attributes.Clear();
            TextBox3.Text = string.Empty;
            TextBox5.Text = string.Empty;
            success.Style.Add("display", "block");
        }
        catch
        {
            failed.Style.Add("display", "block");
        }
    }

    protected void OnRowEditing(object sender, GridViewEditEventArgs e)
    {
        grdImages.EditIndex = e.NewEditIndex;
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Tests WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox7.Text);
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

                TextBox txtw = (TextBox)grdImages.Rows[e.RowIndex].FindControl("TextBox1xyz");

                TextBox txt1 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt4xyzx1");
                TextBox txt2 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt4xyzx2");

                TextBox txt4 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt4xyzx1231");

                TextBox txtdisc = (TextBox)grdImages.Rows[e.RowIndex].FindControl("TextBox9");

                DropDownList txtquantity = (DropDownList)grdImages.Rows[e.RowIndex].FindControl("DropDownList3");


                FileUpload file = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("fuEditFile");

                FileUpload file7 = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("FileUpload7");
                FileUpload file8 = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("FileUpload8");
                FileUpload file9 = (FileUpload)grdImages.Rows[e.RowIndex].FindControl("FileUpload9");

                string fileName = string.Empty;
                string newipath;

                string fileName7 = string.Empty;
                string newipath7;

                string fileName8 = string.Empty;
                string newipath8;

                string fileName9 = string.Empty;
                string newipath9;

                string fileName1 = string.Empty;
                string newipath1;

                if (file.HasFile)
                {
                    fileName = Guid.NewGuid() + file.FileName;
                    file.SaveAs(Server.MapPath("Uploads/") + fileName);
                    newipath = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName;
                }
                else
                {
                    Label path1 = (Label)grdImages.Rows[e.RowIndex].FindControl("lblEditFile");
                    newipath = path1.Text;
                }

                if (file7.HasFile)
                {
                    fileName7 = Guid.NewGuid() + file7.FileName;
                    file7.SaveAs(Server.MapPath("Uploads/") + fileName7);
                    newipath7 = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName7;
                }
                else
                {
                    Label path7 = (Label)grdImages.Rows[e.RowIndex].FindControl("Label4");
                    newipath7 = path7.Text;
                }

                if (file8.HasFile)
                {
                    fileName8 = Guid.NewGuid() + file8.FileName;
                    file8.SaveAs(Server.MapPath("Uploads/") + fileName8);
                    newipath8 = "https://healthyuniverse.co.in/Vendor-Panel/Uploads/" + fileName8;
                }
                else
                {
                    Label path8 = (Label)grdImages.Rows[e.RowIndex].FindControl("Label5");
                    newipath8 = path8.Text;
                }



                TextBox txt11 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt1");
                TextBox txt22 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt2");



                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Tests set Title = @Title, Price = @Price, Description = @Description, Path1=@Path1, Quantity=@Quantity, Price1=@Price1, Weight=@Weight, Path3=@Path3, Path4=@Path4, Dtag=@Dtag, Ktag=@Ktag where Id=" + id, con1);
                cmd1.Parameters.AddWithValue("@Title", txt1.Text);
                cmd1.Parameters.AddWithValue("@Price", txt2.Text);
                cmd1.Parameters.AddWithValue("@Description", txt4.Text);
                cmd1.Parameters.AddWithValue("@Path1", newipath);
                cmd1.Parameters.AddWithValue("@Quantity", txtquantity.SelectedItem.Value);
                cmd1.Parameters.AddWithValue("@Price1", txtdisc.Text);
                cmd1.Parameters.AddWithValue("@Weight", txtw.Text);

                cmd1.Parameters.AddWithValue("@Path3", newipath7);
                cmd1.Parameters.AddWithValue("@Path4", newipath8);

                cmd1.Parameters.AddWithValue("@Dtag", txt11.Text);
                cmd1.Parameters.AddWithValue("@Ktag", txt22.Text);
                cmd1.ExecuteNonQuery();
                con1.Close();

                grdImages.EditIndex = -1;
                DataTable dt1 = new DataTable();
                SqlDataAdapter adp1 = new SqlDataAdapter();
                try
                {
                    SqlCommand cmd = new SqlCommand("select * from Tests WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
                    adp1.SelectCommand = cmd;
                    cmd.Parameters.Add("@SearchText", TextBox7.Text);
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
            SqlCommand cmd = new SqlCommand("select * from Tests WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox7.Text);
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
    //protected void DropDownList1_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    if (DropDownList1.SelectedItem.Value == "0")
    //    {
    //        DropDownList2.Enabled = false;

    //    }
    //    else
    //    {
    //        DropDownList2.Enabled = true;
    //        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //        using (SqlConnection con = new SqlConnection(constr))
    //        {
    //            using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Subcategory WHERE Categoryid=@Categoryid"))
    //            {
    //                cmd.Parameters.Add("@Categoryid", DropDownList1.SelectedItem.Value);
    //                cmd.CommandType = CommandType.Text;
    //                cmd.Connection = con;
    //                con.Open();
    //                DropDownList2.DataSource = cmd.ExecuteReader();
    //                DropDownList2.DataTextField = "Title";
    //                DropDownList2.DataValueField = "Id";
    //                DropDownList2.DataBind();
    //                con.Close();
    //            }
    //        }
    //        DropDownList2.Items.Insert(0, new ListItem("--Select Category--", "0"));
    //    }
    //}

    protected void Button5_Click(object sender, EventArgs e)
    {
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Tests WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
            adp1.SelectCommand = cmd;
            cmd.Parameters.Add("@SearchText", TextBox7.Text);
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

    //protected void DropDownList2_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    if (DropDownList2.SelectedItem.Value == "0")
    //    {
    //        DropDownList4.Enabled = false;

    //    }
    //    else
    //    {
    //        DropDownList4.Enabled = true;
    //        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    //        using (SqlConnection con = new SqlConnection(constr))
    //        {
    //            using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Lastcategory WHERE Subcategoryid=@Subcategoryid"))
    //            {
    //                cmd.Parameters.Add("@Subcategoryid", DropDownList2.SelectedItem.Value);
    //                cmd.CommandType = CommandType.Text;
    //                cmd.Connection = con;
    //                con.Open();
    //                DropDownList4.DataSource = cmd.ExecuteReader();
    //                DropDownList4.DataTextField = "Title";
    //                DropDownList4.DataValueField = "Id";
    //                DropDownList4.DataBind();
    //                con.Close();
    //            }
    //        }
    //    }
    //}

    protected void grdImages_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdImages.PageIndex = e.NewPageIndex;
        this.BindGrid1();
    }
    
}