class Patient:
    def __init__(self, pid, name):
        self.pid = pid
        self.name = name


class Doctor:
    def __init__(self, did, name):
        self.did = did
        self.name = name


class AppointmentScheduler:

    def __init__(self):
        self.patients = []
        self.doctors = []
        self.slots = []

    def get_input(self):

        num_patients = int(input("Enter number of patients: "))
        num_doctors = int(input("Enter number of doctors: "))
        num_slots = int(input("Enter number of appointment slots: "))

        print("\n--- Patient Details ---")
        for i in range(num_patients):
            name = input(f"Patient {i+1} Name: ")
            self.patients.append(Patient(i + 1, name))

        print("\n--- Doctor Details ---")
        for i in range(num_doctors):
            name = input(f"Doctor {i+1} Name: ")
            self.doctors.append(Doctor(i + 1, name))

        for i in range(num_slots):
            self.slots.append(f"Slot-{i+1}")

    def is_valid(self, assignments, doctor, slot):

        for p, (d, s) in assignments.items():

            # Doctor cannot handle two appointments
            # in same slot
            if d.did == doctor.did and s == slot:
                return False

        return True

    # MRV Heuristic
    def select_unassigned_patient(self, assignments):

        unassigned = []

        for patient in self.patients:
            if patient not in assignments:
                unassigned.append(patient)

        if not unassigned:
            return None

        return unassigned[0]

    def backtrack(self, assignments):

        if len(assignments) == len(self.patients):
            return assignments

        patient = self.select_unassigned_patient(assignments)

        for doctor in self.doctors:

            for slot in self.slots:

                if self.is_valid(assignments, doctor, slot):

                    assignments[patient] = (doctor, slot)

                    result = self.backtrack(assignments)

                    if result:
                        return result

                    del assignments[patient]

        return None

    def solve(self):

        self.get_input()

        result = self.backtrack({})

        if result is None:
            print("\nNo valid schedule found")
            return

        print("\n===== APPOINTMENT SCHEDULE =====\n")

        print("-" * 60)
        print(f"{'Patient':15} {'Doctor':15} {'Slot':15}")
        print("-" * 60)

        for patient, (doctor, slot) in result.items():

            print(
                f"{patient.name:15} "
                f"{doctor.name:15} "
                f"{slot:15}"
            )

        print("-" * 60)


if __name__ == "__main__":
    AppointmentScheduler().solve()