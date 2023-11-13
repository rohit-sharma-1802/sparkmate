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
  const [isPresent, setIsPresent] = useState(false);

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
          matches,
        } = response.data;
        if (user_id && first_name) {
          setFormData((prevState) => ({
            ...prevState,
            user_id,
            about,
            first_name,
            gender_identity,
            gender_interest,
            dob,
            matches: Array.isArray(matches) ? matches : [],
          }));
          setIsPresent(true);
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
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              placeholder="First Name"
              required={true}
              value={formData.first_name}
              onChange={handleChange}
              disabled={isPresent}
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
                disabled={isPresent}
              />
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
              {loader ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </section>

          <section>
            <label htmlFor="url">Profile Photo</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              id="image"
              onChange={handleChange}
              required={true}
            />
            <div className="photo-container">
              {formData.url && (
                <img src={formData.url} alt="profile pic preview" />
              )}
            </div>
            <br />
            <label>Gender</label>
            <div className="multiple-input-container">
              <input
                id="man-gender-identity"
                type="radio"
                name="gender_identity"
                value="man"
                onChange={handleChange}
                checked={formData.gender_identity === "man"}
                disabled={isPresent}
              />
              <label htmlFor="man-gender-identity">Man</label>
              <input
                id="woman-gender-identity"
                type="radio"
                name="gender_identity"
                value="woman"
                onChange={handleChange}
                checked={formData.gender_identity === "woman"}
                disabled={isPresent}
              />
              <label htmlFor="woman-gender-identity">Woman</label>
              <input
                id="more-gender-identity"
                type="radio"
                name="gender_identity"
                value="more"
                onChange={handleChange}
                checked={formData.gender_identity === "more"}
                disabled={isPresent}
              />
              <label htmlFor="more-gender-identity">More</label>
            </div>

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

            {/* <ImageUpload /> */}
          </section>
        </form>
      </div>
    </>
  );
};
export default OnBoarding;
