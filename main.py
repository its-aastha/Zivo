from agent.command_handler import handle_command


def main():
    print("=" * 45)
    print("              ZIVO - PHASE 1")
    print("=" * 45)

    print("\nZivo: Hey! What can I do for you?")
    print("Type 'exit' to close Zivo.\n")

    while True:

        command = input("You: ")

        if not command.strip():
            continue

        response = handle_command(command)

        if response == "EXIT":
            print("Zivo: Goodbye!")
            break

        print(f"Zivo: {response}\n")


if __name__ == "__main__":
    main()