using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;

public partial class Doctors_Dashboard_Manage : System.Web.UI.Page
{

    protected void Page_Load(object sender, EventArgs e)
    {
        error.Style.Add("display", "none");
        success.Style.Add("display", "none");


        if (!this.IsPostBack)
        {

            HttpCookie returnCookie1x = Request.Cookies["mygoacookie1122"];
            string Memberinfo;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = "SELECT * FROM Doctors WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1x.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                Memberinfo = reader["Id"].ToString();
                Label24.Text = reader["id"].ToString();

                reader.Close();
                connection.Close();
            }

            string First = string.Empty;
            string Last = string.Empty;
            string Username = string.Empty;
            string Fathername = string.Empty;
            string contactno = string.Empty;
            string Aadhaarno = string.Empty;
            string Gender = string.Empty;

            string Street = string.Empty;
            string Address = string.Empty;
            string landmark = string.Empty;
            string permanent = string.Empty;
            string pincode = string.Empty;
            string emailid = string.Empty;
            string houseno = string.Empty;
            string nominee = string.Empty;
            string relationnominee = string.Empty;
            string accountholder = string.Empty;
            string bankname = string.Empty;
            string accountno = string.Empty;
            string IFSCcode = string.Empty;
            string password = string.Empty;
            string state = string.Empty;
            string city = string.Empty;
            string dob = string.Empty;


            string str1x = " SELECT * FROM Doctors WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1x, connection);
                command.Parameters.Add("@Id", Memberinfo);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();


                First = reader["First"].ToString();
                Last = reader["Last"].ToString();
                Username = reader["Username"].ToString();
                Fathername = reader["Fathername"].ToString();
                contactno = reader["Contact"].ToString();
                Aadhaarno = reader["Aadhaarno"].ToString();
                Gender = reader["Gender"].ToString();
                Street = reader["Street"].ToString();
                Address = reader["Address"].ToString();
                landmark = reader["landmark"].ToString();
                permanent = reader["Permanent"].ToString();
                pincode = reader["Pincode"].ToString();
                emailid = reader["Email"].ToString();
                houseno = reader["Houseno"].ToString();
                nominee = reader["Nominee"].ToString();
                relationnominee = reader["Relationnominee"].ToString();
                accountholder = reader["Accountholder"].ToString();
                bankname = reader["Bankname"].ToString();
                accountno = reader["Accountno"].ToString();
                IFSCcode = reader["IFSCcode"].ToString();
                password = reader["Password"].ToString();
                state = reader["state"].ToString();
                city = reader["city"].ToString();
                dob = reader["dob"].ToString();



                Label1.Text = First;
                Label2.Text = Last;

                Label3.Text = Username;
                Label4.Text = Fathername;
                Label5.Text = contactno;
                Label6.Text = Aadhaarno;
                Label7.Text = Gender;

                Label8.Text = city;
                Label9.Text = Address;
                Label10.Text = landmark;
                Label11.Text = permanent;
                Label12.Text = pincode;
                Label13.Text = emailid;

                Label14.Text = houseno;
                Label15.Text = nominee;
                Label16.Text = relationnominee;
                Label17.Text = accountholder;
                Label21.Text = bankname;
                Label18.Text = accountno;
                Label19.Text = IFSCcode;
                Label20.Text = password;
                Label22.Text = dob;
                Label23.Text = state;

                TextBox1.Text = First;
                TextBox2.Text = Last;

                TextBox3.Text = Username;
                TextBox4.Text = Fathername;
                TextBox5.Text = contactno;
                TextBox6.Text = Aadhaarno;
                //TextBox7.Text = Gender;
                TextBox8.Text = city;
                TextBox9.Text = Address;
                TextBox10.Text = landmark;
                TextBox11.Text = permanent;
                TextBox12.Text = pincode;
                TextBox13.Text = emailid;

                TextBox14.Text = houseno;
                TextBox15.Text = nominee;
                TextBox16.Text = relationnominee;
                TextBox17.Text = accountholder;
                TextBox18.Text = accountno;
                TextBox21.Text = bankname;
                TextBox19.Text = IFSCcode;
                TextBox20.Text = password;
                TextBox22.Text = dob;
                DropDownList1.Text = Gender;
                TextBox23.Text = state;


                reader.Close();
                connection.Close();
            }
        }

    }


    protected void Button1_Click(object sender, EventArgs e)
    {
        //try
        {
            HttpCookie returnCookie1x = Request.Cookies["mygoacookie1x"];
            string Id;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Registrations WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1x.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                Id = reader["Id"].ToString();


                reader.Close();
                connection.Close();
            }


            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Registrations SET First=@First, Last=@Last, Username=@Username, Fathername=@Fathername, Contact=@Contact, Aadhaarno=@Aadhaarno, Gender=@Gender, Address=@Address, landmark=@landmark, permanent=@permanent, pincode=@pincode, email=@email, houseno=@houseno, nominee=@nominee, relationnominee=@relationnominee, accountholder=@accountholder, bankname=@bankname, accountno=@accountno, IFSCcode=@IFSCcode, password=@password, State=@State, city=@city, Dob=@Dob WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Id", Id);
                cmd1.Parameters.AddWithValue("@First", Label1.Text);
                cmd1.Parameters.AddWithValue("@Last", Label2.Text);
                cmd1.Parameters.AddWithValue("@Username", Label3.Text);
                cmd1.Parameters.AddWithValue("@Fathername", Label4.Text);
                cmd1.Parameters.AddWithValue("@Contact", Label5.Text);
                cmd1.Parameters.AddWithValue("@Aadhaarno", Label6.Text);
                cmd1.Parameters.AddWithValue("@Gender", DropDownList1.SelectedValue);

                cmd1.Parameters.AddWithValue("@Address", Label9.Text);
                cmd1.Parameters.AddWithValue("@landmark", Label10.Text);
                cmd1.Parameters.AddWithValue("@permanent", Label11.Text);
                cmd1.Parameters.AddWithValue("@pincode", Label12.Text);
                cmd1.Parameters.AddWithValue("@email", Label13.Text);
                cmd1.Parameters.AddWithValue("@houseno", Label15.Text);
                cmd1.Parameters.AddWithValue("@nominee", Label14.Text);
                cmd1.Parameters.AddWithValue("@Relationnominee", Label16.Text);

                cmd1.Parameters.AddWithValue("@accountholder", Label17.Text);
                cmd1.Parameters.AddWithValue("@bankname", Label21.Text);
                cmd1.Parameters.AddWithValue("@accountno", Label18.Text);
                cmd1.Parameters.AddWithValue("@IFSCcode", Label19.Text);
                cmd1.Parameters.AddWithValue("@password", Label20.Text);
                cmd1.Parameters.AddWithValue("@state", Label23.Text);
                cmd1.Parameters.AddWithValue("@city", Label8.Text);
               cmd1.Parameters.AddWithValue("@dob", Label22.Text);

                cmd1.ExecuteNonQuery();
                con1.Close();
            }


            TextBox1.Text = Label1.Text;
            TextBox2.Text = Label2.Text;

            TextBox3.Text = Label3.Text;
            TextBox4.Text = Label4.Text;

            TextBox5.Text = Label5.Text;
            TextBox6.Text = Label6.Text;
            DropDownList1.Text = Label7.Text;
            TextBox8.Text = Label8.Text;
            TextBox9.Text = Label9.Text;

            TextBox10.Text = Label10.Text;
            TextBox11.Text = Label11.Text;
            TextBox12.Text = Label12.Text;
            TextBox13.Text = Label13.Text;
            TextBox14.Text = Label14.Text;
            TextBox15.Text = Label15.Text;
            TextBox16.Text = Label16.Text;
            TextBox17.Text = Label17.Text;
            TextBox18.Text = Label18.Text;
            TextBox19.Text = Label19.Text;
            TextBox20.Text = Label20.Text;
            TextBox21.Text = Label21.Text;
            TextBox22.Text = Label22.Text;
            TextBox23.Text = Label23.Text;


            error.Style.Add("display", "none");
            success.Style.Add("display", "inline-block");
        }
        //catch
        //{
        //    error.Style.Add("display", "inline-block");
        //    success.Style.Add("display", "none");
        //}
    }




    protected void TextBox1_TextChanged(object sender, EventArgs e)
    {
        Label1.Text = TextBox1.Text;
    }

    protected void TextBox2_TextChanged(object sender, EventArgs e)
    {
        Label2.Text = TextBox2.Text;
    }

    protected void TextBox3_TextChanged(object sender, EventArgs e)
    {
        Label3.Text = TextBox3.Text;
    }

    protected void TextBox4_TextChanged(object sender, EventArgs e)
    {
        Label4.Text = TextBox4.Text;
    }

    protected void TextBox5_TextChanged(object sender, EventArgs e)
    {
        Label5.Text = TextBox5.Text;
    }

    protected void TextBox6_TextChanged(object sender, EventArgs e)
    {
        Label6.Text = TextBox6.Text;
    }

    protected void TextBox13_TextChanged(object sender, EventArgs e)
    {
        Label13.Text = TextBox13.Text;
    }

    //protected void TextBox7_TextChanged(object sender, EventArgs e)
    //{
    //    Label7.Text = TextBox7.Text;
    //}

    protected void TextBox9_TextChanged(object sender, EventArgs e)
    {
        Label9.Text = TextBox9.Text;
    }

    protected void TextBox14_TextChanged(object sender, EventArgs e)
    {
        Label14.Text = TextBox14.Text;
    }

    protected void TextBox11_TextChanged(object sender, EventArgs e)
    {
        Label11.Text = TextBox11.Text;
    }

    protected void TextBox10_TextChanged(object sender, EventArgs e)
    {
        Label10.Text = TextBox10.Text;
    }

    protected void TextBox12_TextChanged(object sender, EventArgs e)
    {
        Label12.Text = TextBox12.Text;
    }

    protected void TextBox15_TextChanged(object sender, EventArgs e)
    {
        Label15.Text = TextBox15.Text;
    }

    protected void TextBox16_TextChanged(object sender, EventArgs e)
    {
        Label16.Text = TextBox16.Text;
    }

    protected void TextBox18_TextChanged(object sender, EventArgs e)
    {
        Label18.Text = TextBox18.Text;
    }

    protected void TextBox21_TextChanged(object sender, EventArgs e)
    {
        Label21.Text = TextBox21.Text;
    }

    protected void TextBox17_TextChanged(object sender, EventArgs e)
    {
        Label17.Text = TextBox17.Text;
    }

    protected void TextBox19_TextChanged(object sender, EventArgs e)
    {
        Label19.Text = TextBox19.Text;
    }

    protected void TextBox20_TextChanged(object sender, EventArgs e)
    {
        Label20.Text = TextBox20.Text;
    }

   

    protected void DropDownList1_TextChanged(object sender, EventArgs e)
    {
        Label7.Text = DropDownList1.Text;
    }

    protected void TextBox8_TextChanged(object sender, EventArgs e)
    {
        Label8.Text = TextBox8.Text;
    }

    protected void TextBox22_TextChanged(object sender, EventArgs e)
    {
        Label22.Text = TextBox22.Text;
    }

    protected void TextBox23_TextChanged(object sender, EventArgs e)
    {
        Label23.Text = TextBox23.Text;
    }
}