"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PatientForm from "@/components/PatientForm";

const HealthForm = () => {

  return (
    <div>
      <Navbar />
      <PatientForm />
    </div>
    
  );
};

export default HealthForm;
