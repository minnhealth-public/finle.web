def divide_by_zero_endpoint(request, test_val):
    if request is not None:
        print(test_val / 0)
