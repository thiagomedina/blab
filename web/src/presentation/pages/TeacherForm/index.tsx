import React, {
  useState,
  ChangeEvent,
  useRef,
  FormEvent,
  useCallback,
} from "react";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";

import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import Textarea from "../../components/Textarea";
import Select from "../../components/Select";
import getValidationErrors from "../../../utils/getValidationsErros";
import api from "../../../services/api";
import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";

import warningIcon from "../../assets/images/icons/warning.svg";
import defaultImg from "../../assets/images/default_user.png";
import { FiMinusCircle, FiCamera } from "react-icons/fi";
import { Profile, ErrorMessage, AvatarInput } from "./style";

import "./styles.css";

function TeacherForm() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const history = useHistory();

  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [cost, setCost] = useState("");
  const [subject, setSubject] = useState("");
  const [erro, setErro] = useState(false);

  const [scheduleItems, setScheduleItems] = useState([
    { week_day: 0, from: "", to: "" },
  ]);

  function addNewScheduleItem() {
    setScheduleItems([...scheduleItems, { week_day: 0, from: "", to: "" }]);
  }
  const handleDeleteSchedule = useCallback((index) => {
    const result = scheduleItems.filter((e, i) => i != index);
    setScheduleItems(result);
  }, []);

  async function setScheduleItemValue(
    position: number,
    field: string,
    value: string
  ) {
    const updatedScheduleItems = scheduleItems.map((scheduleItem, index) => {
      if (index === position) {
        return { ...scheduleItem, [field]: value };
      }

      return scheduleItem;
    });

    setScheduleItems(updatedScheduleItems);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    window.scrollTo(0, 0);

    try {
      const schema = Yup.object().shape({
        whatsapp: Yup.string().required(),
        cost: Yup.string().required(),
        bio: Yup.string().required(),
        subject: Yup.string().required(),
        scheduleItems: Yup.array()
          .of(
            Yup.object().shape({
              week_day: Yup.string().required(),
              from: Yup.string().required(),
              to: Yup.string().required(),
            })
          )
          .required(),
      });

      let data = {
        whatsapp,
        bio,
        subject,
        cost,
        scheduleItems,
      };

      await schema.validate(data, {
        abortEarly: false,
      });

      const send = await api.post("classes", {
        whatsapp,
        bio,
        subject,
        cost: Number(cost),
        schedule: scheduleItems,
      });

      console.log(cost);
      setErro(false);
      addToast({
        type: "success",
        title: "Registration completed!",
        description: "Successfully!",
      });
      history.push("/study");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        setErro(true);
        return;
      }
      addToast({
        type: "error",
        title: "Registration error",
        description: "An error occurred while registering, please try again.",
      });
    }
  }

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append("avatar", e.target.files[0]);
        api.patch("/avatar", data).then((response) => {
          updateUser(response.data);
          console.log(user)
        });

      }
    },
    [addToast, updateUser]
  );
  return (
    <div id="page-teacher-form" className="container">
      <PageHeader
        to="/study"
        title="Create your schedule."
        description="First you need to fill the form"
      />

      <main>
        {erro ? (
          <ErrorMessage>
            <img src={warningIcon} alt="Important" />
            Important! <br />
            Fill in all fields
          </ErrorMessage>
        ) : null}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>About you</legend>
            <Profile>
              <AvatarInput>
                <img src={user.avatar ? `http://localhost:3333/files/${user.avatar}` : defaultImg} alt="" />
                <label htmlFor="avatar">
                  <FiCamera />
                  <input
                    type="file"
                    id="avatar"
                    onChange={handleAvatarChange}
                  />
                </label>
              </AvatarInput>
              <span>{user.name}</span>

              <Input
                name="whatsapp"
                label="Whatsapp"
                placeholder="(   ) _  _ _ _ _   _ _ _ _ "
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                }}
              />
            </Profile>

            <Textarea
              name="bio"
              label="Bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
              }}
            />
          </fieldset>

          <fieldset>
            <legend>English level</legend>
            <Select
              name="level"
              label="Level"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
              options={[
                { value: "A1", label: "A1" },
                { value: "A2", label: "A2" },
                { value: "B1", label: "B1" },
                { value: "B2", label: "B2" },
                { value: "C1", label: "C1" },
                { value: "C2", label: "C2" },
                { value: "Native", label: "Native" },
              ]}
            />
            <Input
              name="cost"
              label="Price per hour"
              type="text"
              placeholder="$"
              value={cost}
              onChange={(e) => {
                setCost(e.target.value);
              }}
            />
          </fieldset>

          <fieldset>
            <legend>
              Available times
              <button type="button" onClick={addNewScheduleItem}>
                + New Time
              </button>
            </legend>

            {scheduleItems.map((scheduleItem, index) => {
              return (
                <div key={scheduleItem.week_day} className="schedule-item">
                  <Select
                    name="week_day"
                    label="Week Day"
                    value={scheduleItem.week_day}
                    onChange={(e) =>
                      setScheduleItemValue(index, "week_day", e.target.value)
                    }
                    options={[
                      { value: "0", label: "Sunday" },
                      { value: "1", label: "Monday" },
                      { value: "2", label: "Tuesday" },
                      { value: "3", label: "Wednesday" },
                      { value: "4", label: "Thursday" },
                      { value: "5", label: "Friday" },
                      { value: "6", label: "Saturday" },
                    ]}
                  />
                  <Input
                    name="from"
                    label="From"
                    type="time"
                    defaultValue={scheduleItem.from}
                    onChange={(e) =>
                      setScheduleItemValue(index, "from", e.target.value)
                    }
                  />
                  <Input
                    name="to"
                    label="To"
                    type="time"
                    defaultValue={scheduleItem.to}
                    onChange={(e) =>
                      setScheduleItemValue(index, "to", e.target.value)
                    }
                  />
                  {index === 0 ? null : (
                    <button
                      type="button"
                      onClick={() => handleDeleteSchedule(index)}
                      className="delete-schedule"
                    >
                      <FiMinusCircle />
                    </button>
                  )}
                </div>
              );
            })}
          </fieldset>

          <footer>
            <button type="submit">Save</button>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default TeacherForm;
