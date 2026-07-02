"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { createInterview } from "@/services/interview";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [targetRoleList, setTargetRoleList] = useState<string[]>([
    "前端开发工程师",
    "Java开发工程师",
    "全栈开发工程师",
  ]);

  const [targetRole, setTargetRole] = useState<string | null>(null);

  const [techStackList, setTechStackList] = useState<string[]>([
    "React",
    "Java",
    "Python",
    "Nest",
    "Vue",
    "JavaScript",
    "TypeScript",
  ]);

  const [techStack, setTechStack] = useState<string[]>([]);

  const [experienceYearsList, setExperienceYearsList] = useState<number[]>([
    1, 2, 3, 4, 5, 10, 20,
  ]);

  const [experienceYears, setExperienceYears] = useState<string | null>(null);

  const [difficultyList, setDifficultyList] = useState<any[]>([
    {
      label: "初级",
      value: "junior",
    },
    {
      label: "中级",
      value: "middle",
    },
    {
      label: "高级",
      value: "senior",
    },
  ]);

  const [difficulty, setDifficulty] = useState<string | null>(null);

  const onConfirm = async () => {
    const data = {
      target_role: targetRole,
      tech_stack: techStack,
      experience_years: experienceYears,
      difficulty: difficultyList.find((d) => d.label === difficulty).value,
    };
    const result = await createInterview(data);
    console.log(result);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        岗位:
        <Combobox items={targetRoleList} onValueChange={setTargetRole}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex items-center">
        技术栈:
        <Combobox
          items={techStackList}
          multiple
          value={techStack}
          onValueChange={setTechStack}
        >
          <ComboboxChips>
            <ComboboxValue>
              {techStack.map((item) => (
                <ComboboxChip key={item}>{item}</ComboboxChip>
              ))}
            </ComboboxValue>
            <ComboboxChipsInput />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex items-center">
        工作年限:
        <Combobox
          items={experienceYearsList}
          onValueChange={setExperienceYears}
        >
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex items-center">
        出题难度:
        <Combobox items={difficultyList} onValueChange={setDifficulty}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item.label}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <button onClick={onConfirm}>确定</button>
    </div>
  );
}
