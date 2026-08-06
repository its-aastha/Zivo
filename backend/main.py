from agent.command_handler import handle_command


def main():
    print("=" * 50)
    print("        🤖 Welcome to Zivo 👻")
    print(" Type 'exit' to quit the assistant.")
    print("=" * 50)

    while True:
        command = input("\nYou: ").strip()

        if not command:
            continue

        if command.lower() in ["exit", "quit", "bye"]:
            print("\nZivo 👻: Goodbye! Have a great day.")
            break

        try:
            response = handle_command(command)
            print(f"\nZivo 👻: {response}")

        except Exception as e:
            print(f"\nZivo 👻: Error - {e}")


if __name__ == "__main__":
    main()