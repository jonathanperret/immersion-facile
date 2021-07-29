import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "src/app/reduxHooks";
import { actions } from "src/core-logic/store/rootActions";
import { v4 as uuidV4 } from "uuid";

export const Formulaire = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [startDate, setStartDate] = useState<null | Date>(null);
  const [endDate, setEndDate] = useState<null | Date>(null);

  const emailRegex = /\S+@\S+\.\S+/;

  const validateEmail = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value;
    if (emailRegex.test(email)) {
      setIsEmailValid(true);
      setEmail(email)
    } else {
      setIsEmailValid(false);
    }
  };

  const readyToSubmit = () => {
    return isEmailValid && startDate !== null && endDate !== null && (endDate > startDate);
  }

  return (
    <div className="Formulaire" id="form-body">

      <div className="fr-input-group">
        <label className="fr-label" htmlFor="text-input-calendar">
          Debut de l'immersion
        </label>
        <div className="fr-input-wrap fr-fi-calendar-line">
          <input className="fr-input" type="date" id="text-input-calendar"
            name="text-input-calendar"
            onChange={(evt) => {
              setStartDate(evt.currentTarget.valueAsDate)

            }}
          />
        </div>
      </div>

      <div className="fr-input-group">
        <label className="fr-label" htmlFor="text-input-calendar">
          Fin de l'immersion
        </label>
        <div className="fr-input-wrap fr-fi-calendar-line">
          <input className="fr-input" type="date" id="text-input-calendar"
            name="text-input-calendar"
            min={startDate?.toISOString().split('T')[0]}
            value={endDate ? endDate.toISOString().split('T')[0] : ""}
            onMouseDown={(evt) => {
              if (startDate && !endDate) {
                // An immersion often is one month, so prefill the date for convenience.
                var oneMonthLater = new Date(startDate);
                oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                setEndDate(oneMonthLater);
              }
            }}
            onChange={(evt) => {
              setEndDate(evt.currentTarget.valueAsDate)
            }}
          />
        </div>
      </div>

      <div className={`fr-input-group${isEmailValid ? '' : ' fr-input-group--error'}`}>
        <label className="fr-label" htmlFor="text-input-error">
          Email
        </label>
        <input className={`fr-input${isEmailValid ? '' : ' fr-input--error'}`}
          aria-describedby="text-input-error-desc-error"
          type="text"
          id="text-input-email"
          name="text-input-email"
          onChange={(evt) => {
            validateEmail(evt);
          }}
        />
        {!isEmailValid && <p id="text-input-email-error-desc-error" className="fr-error-text">
          Email incorrect
        </p>}
      </div>


      <button className="fr-btn fr-fi-checkbox-circle-line fr-btn--icon-left"
        disabled={!readyToSubmit()}
      >
        Valider ce formulaire
      </button>

    </div>
  );
};
