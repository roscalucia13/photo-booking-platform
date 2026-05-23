import React from "react";
import { useParams } from "react-router-dom";
import UserBookingPage from "./UserBookingPage"; // Importă corect componenta ta

const UserBookingPageWrapper = () => {
  const { id } = useParams();
  return <UserBookingPage prestatorId={id} />;
};

export default UserBookingPageWrapper;
