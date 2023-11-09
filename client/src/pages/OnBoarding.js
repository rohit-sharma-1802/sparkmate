import Nav from "../components/Nav";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageUpload from "../components/ImageUpload";
import { Hearts } from "react-loader-spinner";

const OnBoarding = () => {
  const [cookies] = useCookies(["user"]);
  const [loader, setLoader] = useState(false);
  const [formData, setFormData] = useState({
    user_id: cookies.UserId ?? "",
    first_name: "",
    dob: "",
    show_gender: false,
    gender_identity: "man",
    gender_interest: "woman",
    about: "",
    matches: [],
  });

  let navigate = useNavigate();

  useEffect(() => {
    const userId = cookies.UserId;
    if (!userId) navigate("/");
  }, []);

  useEffect(() => {
    axios({
      method: "GET",
      url: "http://localhost:8000/user",
      params: { userId: cookies.UserId },
    })
      .then((response) => {
        const {
          user_id,
          about,
          dob,
          first_name,
          gender_identity,
          gender_interest,
        } = response.data;
        if (user_id && first_name) {
          setFormData({
            about,
            first_name,
            gender_identity,
            gender_interest,
            dob,
          });
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    const formdata = new FormData();
    for (const key in formData) {
      formdata.append(key, formData[key]);
    }
    try {
      const response = await axios.post("http://localhost:8000/user", formdata);
      setLoader(false);
      const success = response.status === 200;
      if (success) navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "file"
        ? e.target.files[0]
        : e.target.value;
    const name = e.target.name;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Nav minimal={true} setShowModal={() => {}} showModal={false} />

      <div className="onboarding">
        <h2>CREATE ACCOUNT</h2>

        <form onSubmit={handleSubmit}>
          <section>
            <label htmlFor="first_name">Full Name</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              placeholder="Full Name"
              required={true}
              value={formData.first_name}
              onChange={handleChange}
            />

            <label>Date of Birth</label>
            <div className="multiple-input-container">
              <input
                id="dob"
                type="date"
                name="dob"
                required={true}
                value={formData.dob}
                onChange={handleChange}
              />

              {/* <input
                                id="dob_day"
                                type="number"
                                name="dob_day"
                                placeholder="DD"
                                required={true}
                                value={formData.dob_day}
                                onChange={handleChange}
                            />

                            <input
                                id="dob_month"
                                type="number"
                                name="dob_month"
                                placeholder="MM"
                                required={true}
                                value={formData.dob_month}
                                onChange={handleChange}
                            />

                            <input
                                id="dob_year"
                                type="number"
                                name="dob_year"
                                placeholder="YYYY"
                                required={true}
                                value={formData.dob_year}
                                onChange={handleChange}
                            /> */}
            </div>

            <label>Gender</label>
            <div className="multiple-input-container">
              <input
                id="man-gender-identity"
                type="radio"
                name="gender_identity"
                value="man"
                onChange={handleChange}
                checked={formData.gender_identity === "man"}
              />
              <label htmlFor="man-gender-identity">Man</label>
              <input
                id="woman-gender-identity"
                type="radio"
                name="gender_identity"
                value="woman"
                onChange={handleChange}
                checked={formData.gender_identity === "woman"}
              />
              <label htmlFor="woman-gender-identity">Woman</label>
              <input
                id="more-gender-identity"
                type="radio"
                name="gender_identity"
                value="more"
                onChange={handleChange}
                checked={formData.gender_identity === "more"}
              />
              <label htmlFor="more-gender-identity">More</label>
            </div>

            {/* <label htmlFor="show-gender">Show Gender on my Profile</label>

                        <input
                            id="show-gender"
                            type="checkbox"
                            name="show_gender"
                            onChange={handleChange}
                            checked={formData.show_gender}
                        /> */}

            <label>Interested in</label>

            <div className="multiple-input-container">
              <input
                id="man-gender-interest"
                type="radio"
                name="gender_interest"
                value="man"
                onChange={handleChange}
                checked={formData.gender_interest === "man"}
              />
              <label htmlFor="man-gender-interest">Man</label>
              <input
                id="woman-gender-interest"
                type="radio"
                name="gender_interest"
                value="woman"
                onChange={handleChange}
                checked={formData.gender_interest === "woman"}
              />
              <label htmlFor="woman-gender-interest">Woman</label>
              <input
                id="everyone-gender-interest"
                type="radio"
                name="gender_interest"
                value="everyone"
                onChange={handleChange}
                checked={formData.gender_interest === "everyone"}
              />
              <label htmlFor="everyone-gender-interest">Everyone</label>
            </div>

            <label htmlFor="about">About me</label>
            <input
              id="about"
              type="text"
              name="about"
              required={true}
              placeholder="I like to listen music..."
              value={formData.about}
              onChange={handleChange}
            />

            <button className="submit" type="submit">
              {loader ? (
                <>
                  <Hearts
                    height="20"
                    width="350"
                    color="red"
                    ariaLabel="hearts-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                </>
              ) : (
                "SUBMIT"
              )}
            </button>
          </section>

          <section>
            <label htmlFor="url">Profile Photo</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              id="image"
              // type="url"
              // name="url"
              // id="url"
              onChange={handleChange}
              required={true}
            />
            <div className="photo-container">
              {formData.url && (
                <img src={formData.url} alt="profile pic preview" />
              )}
            </div>

            {/* <ImageUpload /> */}
          </section>
        </form>
      </div>
    </>
  );
};
export default OnBoarding;
