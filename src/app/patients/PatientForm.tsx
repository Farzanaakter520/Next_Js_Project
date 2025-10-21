"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---------------- ZOD Schema ----------------

const patientSchema = z.object({
    patient_generated_uid: z.string().min(1, "Patient ID is required"),
    name: z.string().min(1, "Name is required"),
    age: z.number().min(1, "Age is required"),

    gender: z.union([z.literal("M"), z.literal("F"), z.literal("O")])
        .refine((val) => !!val, { message: "Gender is required" }),

    religion: z.union([z.literal("I"), z.literal("H"), z.literal("C"), z.literal("B"), z.literal("O")])
        .refine((val) => !!val, { message: "Religion is required" }),

    marital_status: z.union([z.literal("S"), z.literal("M"), z.literal("D"), z.literal("W")]).optional(),

    occupation: z.string().max(3).optional(),
    mobile_number: z.string().min(11, "Mobile number must be at least 11 digits"),
    address_line_one: z.string().min(1, "Address is required"),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientForm() {
    const form = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            gender: "M",
            religion: "I",
        },
    });

    const onSubmit = (data: PatientFormData) => {
        console.log("Patient Data:", data);
        alert("Patient data submitted successfully ✅");
    };

    return (
        <div className="w-9/12 text-2xl flex items-center justify-center bg-gray-100 p-6">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-9/12  max-w-8xl bg-white rounded-3xl shadow-lg p-3 space-y-6"
            >
                <h2 className="text-5xl font-bold text-center text-gray-800">🧍‍♀️ Patient Information</h2>

                <div className="space-y-4 ">
                    <label className="block mb-1 text-gray-700 ">Patient Name</label>
                    <Input className="text-2xl h-10" placeholder="Patient ID" {...form.register("patient_generated_uid")} />
                    <label className="block mb-3 text-gray-700 ">Full Name</label>

                    <Input className="text-2xl h-10" placeholder="Full Name" {...form.register("name")} />
                    <label className="block mb-1 text-gray-700 ">Age</label>

                    <Input className="text-2xl h-10" type="number" placeholder="Age" {...form.register("age", { valueAsNumber: true })} />

                    <div>
                        <label className="block mb-1 h-10 text-gray-700 ">Gender</label>
                        <Select
                            onValueChange={(val) => form.setValue("gender", val as any)}
                            defaultValue={form.getValues("gender")}
                        >
                            <SelectTrigger className="w-full border rounded-lg p-2">
                                <SelectValue placeholder="gender" />
                            </SelectTrigger>
                            <SelectContent >
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                                <SelectItem value="O">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 ">Religion</label>
                        <Select
                            onValueChange={(val) => form.setValue("religion", val as any)}
                            defaultValue={form.getValues("religion")}
                        >
                            <SelectTrigger className="w-full border rounded-lg p-2">
                                <SelectValue placeholder="religion" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="I">Islam</SelectItem>
                                <SelectItem value="H">Hindu</SelectItem>
                                <SelectItem value="C">Christian</SelectItem>
                                <SelectItem value="B">Buddhist</SelectItem>
                                <SelectItem value="O">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 ">Marital Status</label>
                        <Select onValueChange={(val) => form.setValue("marital_status", val as any)}>
                            <SelectTrigger className="w-full border rounded-lg p-2">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="S">Single</SelectItem>
                                <SelectItem value="M">Married</SelectItem>
                                <SelectItem value="D">Divorced</SelectItem>
                                <SelectItem value="W">Widowed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <label className="block mb-1 text-gray-700 ">Occupation</label>

                    <Input className="text-2xl h-10" placeholder="Occupation" {...form.register("occupation")} />
                    <label className="block mb-1 text-gray-700 font-medium">Mobile Number</label>

                    <Input className="text-2xl h-10" placeholder="Mobile Number" {...form.register("mobile_number")} />

                    {/* Address as Textarea */}
                    <div>
                        <label className="block mb-1 text-gray-700 ">Address</label>
                        <Textarea placeholder="Address" {...form.register("address_line_one")} className="w-full min-h-[120px]" />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full py-4 mt-4 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl font-semibold text-lg"
                >
                    Submit
                </Button>
            </form>
        </div>
    );
}
