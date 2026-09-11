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


public partial class System_Administrator_Products : System.Web.UI.Page
{
    string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
    SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
    protected void Page_Load(object sender, EventArgs e)
    {
        failed.Style.Add("display", "none");
        if (!this.IsPostBack)
        {
            ViewState["Filter"] = "ALL";
            DataTable dt = BindGrid();
            TableCell tableCell = grdImages.HeaderRow.Cells[0];
            Image img = new Image();
            img.ImageUrl = "Images/asc.png";
            tableCell.Controls.Add(new LiteralControl("&nbsp;"));
            tableCell.Controls.Add(img);
            ViewState["tables"] = dt;
            BindGrid();
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Parentcategory"))
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


        }
    }
    private DataTable BindGrid()
    {
        DataTable dt = new DataTable();
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        string query = "SELECT * FROM Products ";
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand())
            {
                if (ViewState["Filter"].ToString() == "ALL")
                {

                }
                else if (ViewState["Filter"].ToString() == "10")
                {
                    query = "SELECT TOP 5 * FROM Products Order By Id Desc";
                }
                else
                {
                    query += " WHERE Title = @Filter";
                    cmd.Parameters.AddWithValue("@Filter", ViewState["Filter"].ToString());
                }

                cmd.CommandText = query;
                cmd.Connection = con;
                using (SqlDataAdapter sda = new SqlDataAdapter())
                {
                    sda.SelectCommand = cmd;
                    sda.Fill(dt);
                   grdImages.DataSource = dt;
                   grdImages.DataBind();
                }
            }
        }

        DropDownList section = (DropDownList)grdImages.HeaderRow.FindControl("section");
        this.BindCountryList(section);

        return dt;
    }
    private void BindCountryList(DropDownList Dept)
    {
        String strConnString = System.Configuration.ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(strConnString);
        SqlDataAdapter sda = new SqlDataAdapter();
        SqlCommand cmd = new SqlCommand("SELECT Title FROM Products");
        cmd.Connection = con;
     
        Dept.Items.FindByValue(ViewState["Filter"].ToString()).Selected = true;
    }
    protected void grdImages_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {

        try
        {
            //Get the Image_Id from the DataKeyNames
            int imgId = Convert.ToInt32(grdImages.DataKeys[e.RowIndex].Value);
            SqlCommand cmd = new SqlCommand("delete from Products where Id=@Id", con);
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
   
    protected void Button1_Click(object sender, EventArgs e)
    {
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
                path1 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName1;
            }
            else
            {
                path1 = "https://healthyuniverse.co.in/System-Administrator/testpic1.jpg";
            }

          
            if (FileUpload4.HasFile)
            {
                fileName4 = Guid.NewGuid() + FileUpload4.FileName;
                FileUpload4.SaveAs(Server.MapPath("Uploads/") + fileName4);
                path4 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName4;
            }
            else
            {
                path4 = "https://healthyuniverse.co.in/System-Administrator/testpic1.jpg";
            }

            if (FileUpload5.HasFile)
            {
                fileName5 = Guid.NewGuid() + FileUpload5.FileName;
                FileUpload5.SaveAs(Server.MapPath("Uploads/") + fileName5);
                path5 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName5;
            }
            else
            {
                path5 = "https://healthyuniverse.co.in/System-Administrator/testpic1.jpg";
            }

           
            string str = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            SqlCommand cmd = new SqlCommand("Insert into Products (Title,Categoryid,Description,Quantity,Price,Price1,Path1,Subcategoryid,IsSelected,Weight,Path3,Path4,Dtag,Ktag,Lastcategoryid) values (@Title,@Categoryid,@Description,@Quantity,@Price,@Price1,@Path1,@Subcategoryid,@IsSelected,@Weight,@Path3,@Path4,@Dtag,@Ktag,@Lastcategoryid)", con);
            cmd.Parameters.AddWithValue("@Title", TextBox2.Text);
            cmd.Parameters.AddWithValue("@Categoryid", DropDownList1.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@Description", TextBox4.Text);
            cmd.Parameters.AddWithValue("@Quantity", DropDownList3.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@Price", TextBox6.Text);
            cmd.Parameters.AddWithValue("@Price1", TextBox8.Text);
            cmd.Parameters.AddWithValue("@Path1", path1);
            cmd.Parameters.AddWithValue("@Path3", path4);
            cmd.Parameters.AddWithValue("@Path4", path5);
            cmd.Parameters.AddWithValue("@Subcategoryid", DropDownList2.SelectedItem.Value);
            cmd.Parameters.AddWithValue("@IsSelected", 0);
            cmd.Parameters.AddWithValue("@Weight", TextBox1.Text);
            cmd.Parameters.AddWithValue("@Dtag", TextBox3.Text);
            cmd.Parameters.AddWithValue("@Ktag", TextBox5.Text);
            cmd.Parameters.AddWithValue("@Lastcategoryid", DropDownList4.SelectedItem.Value);
            if (con.State == ConnectionState.Closed)
            {
                con.Open();
            }
            cmd.Connection = con;
            cmd.ExecuteNonQuery();
            cmd.Dispose();
            con.Close();
            BindGrid();
            TextBox2.Text = string.Empty;
            TextBox4.Text = string.Empty;
            TextBox6.Text = string.Empty;
            TextBox8.Text = string.Empty;
            DropDownList3.ClearSelection();
            TextBox1.Text = string.Empty;
       
            DropDownList1.ClearSelection();
            DropDownList2.ClearSelection();
            DropDownList4.ClearSelection();
            DropDownList4.Enabled = false;

            FileUpload1.Attributes.Clear();
          
            FileUpload4.Attributes.Clear();
            FileUpload5.Attributes.Clear();

            TextBox3.Text = string.Empty;
            TextBox5.Text = string.Empty;

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
            SqlCommand cmd = new SqlCommand("select * from Products WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
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
                    newipath = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName;
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
                    newipath7 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName7;
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
                    newipath8 = "https://healthyuniverse.co.in/System-Administrator/Uploads/" + fileName8;
                }
                else
                {
                    Label path8 = (Label)grdImages.Rows[e.RowIndex].FindControl("Label5");
                    newipath8 = path8.Text;
                }

               
                
                TextBox txt11 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt1");
                TextBox txt22 = (TextBox)grdImages.Rows[e.RowIndex].FindControl("txt2");



                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Products set Title = @Title, Price = @Price, Description = @Description, Path1=@Path1, Quantity=@Quantity, Price1=@Price1, Weight=@Weight, Path3=@Path3, Path4=@Path4, Dtag=@Dtag, Ktag=@Ktag where Id=" + id, con1);
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
                    SqlCommand cmd = new SqlCommand("select * from Products WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
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
            SqlCommand cmd = new SqlCommand("select * from Products WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
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
    protected void DropDownList1_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (DropDownList1.SelectedItem.Value == "0")
        {
            DropDownList2.Enabled = false;

        }
        else
        {
            DropDownList2.Enabled = true;
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Subcategory WHERE Categoryid=@Categoryid"))
                {
                    cmd.Parameters.Add("@Categoryid", DropDownList1.SelectedItem.Value);
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
            DropDownList2.Items.Insert(0, new ListItem("--Select Category--", "0"));
        }
    }

    protected void Button5_Click(object sender, EventArgs e)
    {
        DataTable dt1 = new DataTable();
        SqlDataAdapter adp1 = new SqlDataAdapter();
        try
        {
            SqlCommand cmd = new SqlCommand("select * from Products WHERE Title like '%' + @SearchText + '%' ORDER BY Id DESC", con);
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

    protected void DropDownList2_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (DropDownList2.SelectedItem.Value == "0")
        {
            DropDownList4.Enabled = false;

        }
        else
        {
            DropDownList4.Enabled = true;
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Title FROM Lastcategory WHERE Subcategoryid=@Subcategoryid"))
                {
                    cmd.Parameters.Add("@Subcategoryid", DropDownList2.SelectedItem.Value);
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList4.DataSource = cmd.ExecuteReader();
                    DropDownList4.DataTextField = "Title";
                    DropDownList4.DataValueField = "Id";
                    DropDownList4.DataBind();
                    con.Close();
                }
            }
        }
    }

    protected void grdImages_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdImages.PageIndex = e.NewPageIndex;
        this.BindGrid();
    }
    protected void DeptChanged(object sender, EventArgs e)
    {
        DropDownList ddlCountry = (DropDownList)sender;
        ViewState["Filter"] = ddlCountry.SelectedValue;
        this.BindGrid();
        TableCell tableCell = grdImages.HeaderRow.Cells[0];
        Image img = new Image();
        img.ImageUrl = "Images/asc.png";
        tableCell.Controls.Add(new LiteralControl("&nbsp;"));
        tableCell.Controls.Add(img);
    }
    protected void grdImages_Sorting(object sender, GridViewSortEventArgs e)
    {
        string SortDir = string.Empty;
        DataTable dt = new DataTable();
        dt = ViewState["tables"] as DataTable;
        if (dir == SortDirection.Descending)
        {
            dir = SortDirection.Ascending;
            SortDir = "Desc";
        }
        else
        {
            dir = SortDirection.Descending;
            SortDir = "Asc";
        }
        DataView sortedView = new DataView(dt);
        sortedView.Sort = e.SortExpression + " " + SortDir;
        grdImages.DataSource = sortedView;
        grdImages.DataBind();
        DropDownList section = (DropDownList)grdImages.HeaderRow.FindControl("section");
        this.BindCountryList(section);
        for (int i = 0; i < grdImages.Columns.Count; i++)
        {
            if (grdImages.HeaderRow.Cells[i].Controls[0].GetType().Name == "DataControlLinkButton")
            {
                string lbText = ((LinkButton)grdImages.HeaderRow.Cells[i].Controls[0]).Text;
                if (lbText == e.SortExpression)
                {
                    TableCell tableCell = grdImages.HeaderRow.Cells[i];
                    Image img = new Image();
                    img.ImageUrl = (SortDir == "Asc") ? "Images/asc.png" : "Images/desc.png";
                    tableCell.Controls.Add(new LiteralControl("&nbsp;"));
                    tableCell.Controls.Add(img);
                }
            }
        }
    }

    public SortDirection dir
    {
        get
        {
            if (ViewState["dirState"] == null)
            {
                ViewState["dirState"] = SortDirection.Descending;
            }
            return (SortDirection)ViewState["dirState"];
        }
        set
        {
            ViewState["dirState"] = value;
        }
    }

    protected void OnPaging(object sender, GridViewPageEventArgs e)
    {
        grdImages.PageIndex = e.NewPageIndex;
        BindGrid();
        TableCell tableCell = grdImages.HeaderRow.Cells[0];
        Image img = new Image();
        img.ImageUrl = "Images/asc.png";
        tableCell.Controls.Add(new LiteralControl("&nbsp;"));
        tableCell.Controls.Add(img);
    }

}