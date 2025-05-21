import { useForm } from "react-hook-form";
import { normalize } from "formulate";

const { register, handleSubmit } = useForm();

function onSubmit(rawValues: Record<string, any>) {
  const { result, errors } = normalize(rawValues, {
    fieldTransformers: {
      email: (val) => val.trim().toLowerCase(),
    },
    validators: {
      email: (val) => val.includes("@"),
    },
    validationMode: "collect",
  });

  if (errors) {
    console.warn("Validation:", errors);
  } else {
    console.log("Cleaned data:", result);
  }
}
