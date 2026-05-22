-- Prevent DELETE on publication_requests
-- Las solicitudes de publicación no se eliminan físicamente.
-- Para retirar una solicitud se usa el estado WITHDRAWN.
CREATE OR REPLACE FUNCTION prevent_publication_request_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'DELETE on publication_requests is not allowed. Use status WITHDRAWN instead.';
END;
$$;

CREATE TRIGGER publication_requests_no_delete
BEFORE DELETE ON publication_requests
FOR EACH ROW EXECUTE FUNCTION prevent_publication_request_delete();

-- Prevent UPDATE of reference_number on publication_requests
-- El número de referencia es inmutable una vez asignado.
CREATE OR REPLACE FUNCTION prevent_publication_request_reference_number_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference_number <> OLD.reference_number THEN
    RAISE EXCEPTION 'UPDATE of reference_number on publication_requests is not allowed.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER publication_requests_no_reference_number_update
BEFORE UPDATE ON publication_requests
FOR EACH ROW EXECUTE FUNCTION prevent_publication_request_reference_number_update();
