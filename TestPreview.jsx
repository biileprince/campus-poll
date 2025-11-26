import { useState } from "react";
import OptionInput from "./components/CreatePoll/OptionInput";
import Card from "./components/Common/card";
import Button from "./components/Common/button";
import Loader from "./components/Common/loader";

export default function TestPreview() {
  const [options, setOptions] = useState(["", ""]);

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Component Preview</h1>

      <Card>
        <h2 className="text-lg mb-3 font-semibold">Option Inputs</h2>
        {options.map((opt, i) => (
          <OptionInput
            key={i}
            value={opt}
            index={i}
            onChange={updateOption}
            onRemove={removeOption}
          />
        ))}

        <Button className="mt-4" onClick={() => setOptions([...options, ""])}>
          Add Option
        </Button>
      </Card>

      <Card>
        <h2 className="text-lg mb-3 font-semibold">Loader Preview</h2>
        <Loader size={28} />
      </Card>
    </div>
  );
}
